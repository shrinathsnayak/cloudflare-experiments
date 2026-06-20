import { describe, it, expect, vi } from "vitest";
import { generateWithGateway } from "../../src/lib/generate";
import { DEFAULT_MODEL, GATEWAY_ID } from "../../src/constants/defaults";

describe("generateWithGateway", () => {
  it("returns gateway metadata for a single cached-path request", async () => {
    const env = {
      AI: {
        run: vi.fn(async (_model, _input, options) => {
          expect(options).toEqual({ gateway: { id: GATEWAY_ID, skipCache: false } });
          return { response: "Hello", "cf-aig-cache-status": "MISS" };
        }),
      },
    };

    const result = await generateWithGateway(env as never, "Say hello", false);

    expect(result.response).toBe("Hello");
    expect(result.gateway).toMatchObject({
      id: GATEWAY_ID,
      model: DEFAULT_MODEL,
      cacheStatus: "MISS",
      skipCache: false,
    });
    expect(result.cacheComparison).toBeUndefined();
  });

  it("compares cached and skipCache runs when compareCache is true", async () => {
    const env = {
      AI: {
        run: vi
          .fn()
          .mockResolvedValueOnce({ response: "Cached path", "cf-aig-cache-status": "HIT" })
          .mockResolvedValueOnce({ response: "Skip cache path" }),
      },
    };

    const result = await generateWithGateway(env as never, "Compare cache", true);

    expect(env.AI.run).toHaveBeenCalledTimes(2);
    expect(result.cacheComparison).toMatchObject({
      cached: { cacheStatus: "HIT", skipCache: false },
      skipCache: { cacheStatus: "BYPASS", skipCache: true },
    });
  });
});
