import { describe, it, expect, vi } from "vitest";
import { fetchWithTiming } from "../../src/lib/fetch";

describe("fetchWithTiming", () => {
  it("returns ok result for successful fetch", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("ok", { status: 200 })));

    const result = await fetchWithTiming("https://example.com");
    expect(result.ok).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);

    vi.unstubAllGlobals();
  });

  it("returns error details when fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network failure")));

    const result = await fetchWithTiming("https://example.com");
    expect(result.ok).toBe(false);
    expect(result.statusCode).toBe(0);
    expect(result.error).toBe("network failure");

    vi.unstubAllGlobals();
  });
});
