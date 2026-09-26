import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractMarkdown, extractScrapeResults, runQuickAction } from "../../src/lib/browser";
import type { BrowserRun } from "../../src/types/env";

describe("runQuickAction", () => {
  it("parses JSON from a Response", async () => {
    const browser: BrowserRun = {
      quickAction: vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true, result: "# Hello" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      ),
    };

    const payload = await runQuickAction(browser, "markdown", {
      url: "https://example.com",
    });
    expect(payload.result).toBe("# Hello");
  });

  it("uses result object directly", async () => {
    const browser: BrowserRun = {
      quickAction: vi.fn().mockResolvedValue({
        success: true,
        result: [{ selector: "h1", results: [] }],
      }),
    };

    const payload = await runQuickAction(browser, "scrape", {
      url: "https://example.com",
      elements: [{ selector: "h1" }],
    });
    expect(Array.isArray(payload.result)).toBe(true);
  });

  it("throws when Response is not ok", async () => {
    const browser: BrowserRun = {
      quickAction: vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: false, error: "upstream" }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        })
      ),
    };

    await expect(
      runQuickAction(browser, "markdown", { url: "https://example.com" })
    ).rejects.toThrow(/upstream|failed/i);
  });
});

describe("extractMarkdown / extractScrapeResults", () => {
  it("extracts markdown string", () => {
    expect(extractMarkdown({ result: "# Title" })).toBe("# Title");
  });

  it("extracts scrape results array", () => {
    const results = [{ selector: "h1", results: [{ text: "Hi" }] }];
    expect(extractScrapeResults({ result: results })).toEqual(results);
  });
});

describe("extract edge cases", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when markdown result is missing", () => {
    expect(() => extractMarkdown({ success: true })).toThrow(/missing/i);
  });

  it("throws when scrape result is missing", () => {
    expect(() => extractScrapeResults({ success: true })).toThrow(/missing/i);
  });
});
