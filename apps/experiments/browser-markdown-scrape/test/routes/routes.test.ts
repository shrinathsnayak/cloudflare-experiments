import { describe, it, expect, vi, beforeEach } from "vitest";
import worker from "../../src/index";
import type { BrowserRun, Env } from "../../src/types/env";

function mockEnv(quickAction: BrowserRun["quickAction"]): Env {
  return { BROWSER: { quickAction } };
}

describe("markdown and scrape routes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("GET /markdown returns markdown from quickAction result object", async () => {
    const quickAction = vi.fn().mockResolvedValue({
      success: true,
      result: "# Example",
    });

    const res = await worker.fetch(
      new Request("http://localhost/markdown?url=https://example.com"),
      mockEnv(quickAction)
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { url: string; markdown: string };
    expect(body.url).toBe("https://example.com/");
    expect(body.markdown).toBe("# Example");
    expect(quickAction).toHaveBeenCalledWith("markdown", {
      url: "https://example.com/",
    });
  });

  it("GET /markdown parses Response from quickAction", async () => {
    const quickAction = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, result: "# From Response" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const res = await worker.fetch(
      new Request("http://localhost/markdown?url=https://example.com"),
      mockEnv(quickAction)
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { markdown: string };
    expect(body.markdown).toBe("# From Response");
  });

  it("GET /markdown rejects invalid url", async () => {
    const res = await worker.fetch(new Request("http://localhost/markdown"), mockEnv(vi.fn()));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_URL");
  });

  it("GET /markdown returns 502 when quickAction throws", async () => {
    const quickAction = vi.fn().mockRejectedValue(new Error("binding unavailable"));

    const res = await worker.fetch(
      new Request("http://localhost/markdown?url=https://example.com"),
      mockEnv(quickAction)
    );

    expect(res.status).toBe(502);
    const body = (await res.json()) as { code?: string; error?: string };
    expect(body.code).toBe("MARKDOWN_ERROR");
    expect(body.error).toMatch(/binding unavailable/);
  });

  it("GET /scrape returns results from quickAction", async () => {
    const results = [
      {
        selector: "h1",
        results: [{ text: "Example Domain", html: "Example Domain" }],
      },
    ];
    const quickAction = vi.fn().mockResolvedValue({ success: true, result: results });

    const res = await worker.fetch(
      new Request("http://localhost/scrape?url=https://example.com&selector=h1"),
      mockEnv(quickAction)
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { url: string; results: unknown };
    expect(body.url).toBe("https://example.com/");
    expect(body.results).toEqual(results);
    expect(quickAction).toHaveBeenCalledWith("scrape", {
      url: "https://example.com/",
      elements: [{ selector: "h1" }],
    });
  });

  it("GET /scrape requires selector", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/scrape?url=https://example.com"),
      mockEnv(vi.fn())
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("MISSING_SELECTOR");
  });

  it("GET /scrape returns 502 when quickAction throws", async () => {
    const quickAction = vi.fn().mockRejectedValue(new Error("timeout"));

    const res = await worker.fetch(
      new Request("http://localhost/scrape?url=https://example.com&selector=h1"),
      mockEnv(quickAction)
    );

    expect(res.status).toBe(502);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("SCRAPE_ERROR");
  });
});
