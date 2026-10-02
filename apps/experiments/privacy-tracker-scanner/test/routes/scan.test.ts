import { describe, it, expect, vi, beforeEach } from "vitest";

const { launch } = vi.hoisted(() => ({ launch: vi.fn() }));

vi.mock("@cloudflare/puppeteer", () => ({ default: { launch } }));

import worker from "../../src/index";
import type { Env } from "../../src/types/env";

const env: Env = { BROWSER: {} as Fetcher };

type RequestHandler = (request: { url: () => string }) => void;

function mockBrowser(options: { requestUrls: string[]; gotoError?: Error }) {
  const close = vi.fn();
  let onRequest: RequestHandler | null = null;
  const send = vi.fn().mockResolvedValue({
    cookies: [
      {
        name: "_fbp",
        domain: ".example.com",
        expires: 1_900_000_000,
        secure: false,
        httpOnly: false,
        sameSite: "Lax",
      },
      { name: "IDE", domain: ".doubleclick.net", expires: -1, secure: true, httpOnly: true },
    ],
  });
  const page = {
    setViewport: vi.fn(),
    on: vi.fn((event: string, handler: RequestHandler) => {
      if (event === "request") onRequest = handler;
    }),
    goto: vi.fn(async () => {
      for (const url of options.requestUrls) onRequest?.({ url: () => url });
      if (options.gotoError) throw options.gotoError;
    }),
    url: vi.fn().mockReturnValue("https://example.com/"),
    createCDPSession: vi.fn().mockResolvedValue({ send }),
  };
  launch.mockResolvedValue({ newPage: vi.fn().mockResolvedValue(page), close });
  return { page, close, send };
}

describe("GET /scan", () => {
  beforeEach(() => {
    launch.mockReset();
  });

  it("rejects invalid url", async () => {
    const res = await worker.fetch(new Request("http://localhost/scan?url=ftp://x"), env);
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe("INVALID_URL");
  });

  it("reports trackers and cookies from the captured page", async () => {
    const { close, send } = mockBrowser({
      requestUrls: [
        "https://example.com/",
        "https://connect.facebook.net/en_US/fbevents.js",
        "https://www.facebook.com/tr?id=1",
        "https://static.hotjar.com/c/hotjar.js",
        "https://googleads.g.doubleclick.net/pagead/id",
      ],
    });
    const res = await worker.fetch(
      new Request("http://localhost/scan?url=https://example.com"),
      env
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      firstPartyDomain: string;
      requests: { total: number; thirdParty: number };
      trackers: { name: string; category: string }[];
      cookies: { firstParty: number; thirdParty: number };
      verdict: string;
      timedOut: boolean;
    };
    expect(body.firstPartyDomain).toBe("example.com");
    expect(body.requests).toEqual({ total: 5, thirdParty: 4 });
    expect(body.trackers.map((t) => t.name).sort()).toEqual([
      "Facebook",
      "Facebook Pixel",
      "Google DoubleClick",
      "Hotjar",
    ]);
    expect(body.cookies).toMatchObject({ firstParty: 1, thirdParty: 1 });
    expect(body.verdict).toBe("some-trackers");
    expect(body.timedOut).toBe(false);
    expect(send).toHaveBeenCalledWith("Network.getAllCookies");
    expect(close).toHaveBeenCalled();
  });

  it("keeps partial results when navigation times out", async () => {
    const timeout = new Error("Navigation timeout of 15000 ms exceeded");
    timeout.name = "TimeoutError";
    mockBrowser({ requestUrls: ["https://example.com/"], gotoError: timeout });
    const res = await worker.fetch(
      new Request("http://localhost/scan?url=https://example.com"),
      env
    );
    expect(res.status).toBe(200);
    expect(((await res.json()) as { timedOut: boolean }).timedOut).toBe(true);
  });

  it("returns BROWSER_ERROR when navigation fails", async () => {
    mockBrowser({ requestUrls: [], gotoError: new Error("net::ERR_NAME_NOT_RESOLVED") });
    const res = await worker.fetch(
      new Request("http://localhost/scan?url=https://example.com"),
      env
    );
    expect(res.status).toBe(502);
    expect(((await res.json()) as { code: string }).code).toBe("BROWSER_ERROR");
  });
});
