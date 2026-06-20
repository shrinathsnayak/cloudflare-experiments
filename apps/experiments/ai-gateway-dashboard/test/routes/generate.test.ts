import { describe, it, expect, vi, beforeEach } from "vitest";
import worker from "../../src/index";

const mockEnv = {
  AI: {
    run: vi.fn(async (_model, _input, options?: { gateway?: { skipCache?: boolean } }) => ({
      response: options?.gateway?.skipCache ? "Uncached" : "Cached",
      "cf-aig-cache-status": options?.gateway?.skipCache ? undefined : "MISS",
    })),
  },
};

describe("POST /generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("returns 200 with response and gateway metadata", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Say hello" }),
      }),
      mockEnv
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      response?: string;
      gateway?: { id?: string; cacheStatus?: string };
    };
    expect(body.response).toBe("Cached");
    expect(body.gateway?.id).toBe("default");
    expect(body.gateway?.cacheStatus).toBe("MISS");
  });

  it("returns cacheComparison when compareCache is true", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Compare cache", compareCache: true }),
      }),
      mockEnv
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { cacheComparison?: { latencyDeltaMs?: number } };
    expect(body.cacheComparison).toBeDefined();
    expect(typeof body.cacheComparison?.latencyDeltaMs).toBe("number");
    expect(mockEnv.AI.run).toHaveBeenCalledTimes(2);
  });

  it("returns 400 when prompt is missing", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
      mockEnv
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_PROMPT");
  });
});
