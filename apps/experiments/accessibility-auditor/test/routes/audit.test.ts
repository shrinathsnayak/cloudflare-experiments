import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { launch } = vi.hoisted(() => ({ launch: vi.fn() }));

vi.mock("@cloudflare/puppeteer", () => ({ default: { launch } }));
vi.mock("axe-core", () => ({ default: { source: "window.axe = {}" } }));

import worker from "../../src/index";
import type { Env } from "../../src/types/env";
import type { PageAuditResult } from "../../src/types/audit";

const pageResult: PageAuditResult = {
  axe: {
    violations: [
      {
        id: "image-alt",
        impact: "critical",
        help: "Images must have alternate text",
        helpUrl: "https://dequeuniversity.com/rules/axe/4.10/image-alt",
        nodes: [{ target: ["img"], html: '<img src="/cat.png">' }],
      },
    ],
    passes: 20,
    incomplete: 1,
  },
  imagesMissingAlt: ["https://example.com/cat.png"],
};

function mockBrowser(result: PageAuditResult = pageResult) {
  const close = vi.fn();
  const page = {
    setViewport: vi.fn(),
    setBypassCSP: vi.fn(),
    goto: vi.fn(),
    addScriptTag: vi.fn(),
    evaluate: vi.fn().mockResolvedValue(result),
  };
  launch.mockResolvedValue({ newPage: vi.fn().mockResolvedValue(page), close });
  return { page, close };
}

function createEnv(run = vi.fn()): Env {
  return { BROWSER: {} as Fetcher, AI: { run } as unknown as Ai };
}

describe("GET /audit", () => {
  beforeEach(() => {
    launch.mockReset();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("rejects invalid url", async () => {
    const res = await worker.fetch(new Request("http://localhost/audit?url=ftp://x"), createEnv());
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe("INVALID_URL");
  });

  it("rejects invalid altText flag", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/audit?url=https://example.com&altText=yes"),
      createEnv()
    );
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe("INVALID_QUERY");
  });

  it("returns a compact report and injects axe-core", async () => {
    const { page, close } = mockBrowser();
    const res = await worker.fetch(
      new Request("http://localhost/audit?url=https://example.com"),
      createEnv()
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      counts: { critical: number };
      violations: { id: string }[];
      passes: number;
      altSuggestions?: unknown;
    };
    expect(body.counts.critical).toBe(1);
    expect(body.violations[0].id).toBe("image-alt");
    expect(body.passes).toBe(20);
    expect(body.altSuggestions).toBeUndefined();
    expect(page.addScriptTag).toHaveBeenCalledWith({ content: "window.axe = {}" });
    expect(close).toHaveBeenCalled();
  });

  it("re-injects axe-core when the page reloaded after injection", async () => {
    const { page } = mockBrowser();
    page.evaluate.mockResolvedValueOnce(null).mockResolvedValueOnce(pageResult);
    const res = await worker.fetch(
      new Request("http://localhost/audit?url=https://example.com"),
      createEnv()
    );
    expect(res.status).toBe(200);
    expect(page.addScriptTag).toHaveBeenCalledTimes(2);
  });

  it("adds alt text suggestions when altText=true", async () => {
    mockBrowser();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/png" } })
        )
    );
    const run = vi.fn().mockResolvedValue({ description: "A grey cat on a sofa" });
    const res = await worker.fetch(
      new Request("http://localhost/audit?url=https://example.com&altText=true"),
      createEnv(run)
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { altSuggestions: { src: string; suggestion: string }[] };
    expect(body.altSuggestions).toEqual([
      { src: "https://example.com/cat.png", suggestion: "A grey cat on a sofa" },
    ]);
    expect(run.mock.calls[0][1].image).toEqual([1, 2, 3]);
  });

  it("returns BROWSER_ERROR when puppeteer fails", async () => {
    launch.mockImplementation(async () => {
      throw new Error("no browser");
    });
    const res = await worker.fetch(
      new Request("http://localhost/audit?url=https://example.com"),
      createEnv()
    );
    expect(res.status).toBe(502);
    expect(((await res.json()) as { code: string }).code).toBe("BROWSER_ERROR");
  });
});

describe("POST /alt-text", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("generates alt text from an uploaded image", async () => {
    const run = vi.fn().mockResolvedValue({ description: "Image of a mountain lake" });
    const res = await worker.fetch(
      new Request("http://localhost/alt-text", {
        method: "POST",
        headers: { "content-type": "image/jpeg" },
        body: new Uint8Array([9, 9]),
      }),
      createEnv(run)
    );
    expect(res.status).toBe(200);
    expect(((await res.json()) as { altText: string }).altText).toBe("a mountain lake");
  });

  it("rejects non-image bodies", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/alt-text", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "hello",
      }),
      createEnv()
    );
    expect(res.status).toBe(415);
    expect(((await res.json()) as { code: string }).code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("rejects images over 2MB", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/alt-text", {
        method: "POST",
        headers: { "content-type": "image/png" },
        body: new Uint8Array(2 * 1024 * 1024 + 1),
      }),
      createEnv()
    );
    expect(res.status).toBe(413);
    expect(((await res.json()) as { code: string }).code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("rejects invalid image url", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/alt-text?image=javascript:alert(1)", { method: "POST" }),
      createEnv()
    );
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe("INVALID_URL");
  });

  it("returns AI_ERROR when the model fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(new Uint8Array([1]), { headers: { "content-type": "image/webp" } })
        )
    );
    const run = vi.fn().mockRejectedValue(new Error("model unavailable"));
    const res = await worker.fetch(
      new Request("http://localhost/alt-text?image=https://example.com/a.webp", {
        method: "POST",
      }),
      createEnv(run)
    );
    expect(res.status).toBe(502);
    expect(((await res.json()) as { code: string }).code).toBe("AI_ERROR");
  });
});
