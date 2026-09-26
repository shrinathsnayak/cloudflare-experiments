import { describe, it, expect, vi, beforeEach } from "vitest";

const { launch } = vi.hoisted(() => ({
  launch: vi.fn(),
}));

vi.mock("@cloudflare/puppeteer", () => ({
  default: { launch },
}));

import inspectRoutes from "../../src/routes/inspect";

describe("inspect routes", () => {
  beforeEach(() => {
    launch.mockReset();
  });

  it("returns page metadata from puppeteer", async () => {
    const close = vi.fn();
    const page = {
      setViewport: vi.fn(),
      goto: vi.fn(),
      title: vi.fn().mockResolvedValue("Example Domain"),
      url: vi.fn().mockReturnValue("https://example.com/"),
      cookies: vi.fn().mockResolvedValue([{ name: "a" }]),
      evaluate: vi.fn().mockResolvedValue({
        documentTitle: "Example Domain",
        userAgent: "TestAgent",
        domContentLoaded: 120,
      }),
    };
    launch.mockResolvedValue({
      newPage: vi.fn().mockResolvedValue(page),
      close,
    });

    const res = await inspectRoutes.fetch(
      new Request("http://localhost/inspect?url=https://example.com"),
      { BROWSER: {} as Fetcher }
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      title: string;
      cookiesCount: number;
      userAgent: string;
      performance: { domContentLoaded?: number };
    };
    expect(body.title).toBe("Example Domain");
    expect(body.cookiesCount).toBe(1);
    expect(body.userAgent).toBe("TestAgent");
    expect(body.performance.domContentLoaded).toBe(120);
    expect(close).toHaveBeenCalled();
  });

  it("rejects invalid url", async () => {
    const res = await inspectRoutes.fetch(new Request("http://localhost/inspect"), {
      BROWSER: {} as Fetcher,
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_URL");
  });
});
