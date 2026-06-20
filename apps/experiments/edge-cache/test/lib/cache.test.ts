import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchWithEdgeCache } from "../../src/lib/cache";

function createMockCache(initial?: Response) {
  const store = new Map<string, Response>();
  if (initial) {
    store.set("seed", initial);
  }

  return {
    match: vi.fn(async (request: Request) => {
      for (const response of store.values()) {
        if (response.url === request.url || store.size === 1) {
          return response;
        }
      }
      return undefined;
    }),
    put: vi.fn(async (request: Request, response: Response) => {
      store.set(request.url, response);
    }),
    delete: vi.fn(),
  } as unknown as Cache;
}

describe("fetchWithEdgeCache", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns HIT when cache has a matching response", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const cachedBody = "cached body";
    const cached = new Response(cachedBody, {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
    const cache = createMockCache(cached);
    vi.spyOn(cache, "match").mockResolvedValue(cached);

    const result = await fetchWithEdgeCache({
      url: "https://example.com",
      cache,
      bypass: false,
    });

    expect(result.cacheStatus).toBe("HIT");
    expect(result.statusCode).toBe(200);
    expect(result.bodySize).toBe(cachedBody.length);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns MISS and stores successful responses", async () => {
    const cache = createMockCache();
    vi.spyOn(cache, "match").mockResolvedValue(undefined);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("fresh body", {
        status: 200,
        headers: { "content-type": "text/plain" },
      })
    );

    const result = await fetchWithEdgeCache({
      url: "https://example.com",
      cache,
      bypass: false,
    });

    expect(result.cacheStatus).toBe("MISS");
    expect(result.statusCode).toBe(200);
    expect(cache.put).toHaveBeenCalled();
  });

  it("returns BYPASS and skips cache when bypass is true", async () => {
    const cache = createMockCache();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("live body", {
        status: 200,
        headers: { "content-type": "text/plain" },
      })
    );

    const result = await fetchWithEdgeCache({
      url: "https://example.com",
      cache,
      bypass: true,
    });

    expect(result.cacheStatus).toBe("BYPASS");
    expect(cache.match).not.toHaveBeenCalled();
    expect(cache.put).not.toHaveBeenCalled();
  });
});
