import { describe, it, expect, vi } from "vitest";
import searchRoutes from "../../src/routes/search";
import type { Env } from "../../src/types/env";

describe("search routes", () => {
  it("returns INVALID_QUERY when q is missing", async () => {
    const env = {
      AI: {} as Ai,
      INSTANCE_NAME: "demo-index",
    } satisfies Env;

    const res = await searchRoutes.fetch(new Request("http://localhost/search"), env);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_QUERY");
  });

  it("returns search results from AI Search", async () => {
    const aiSearch = vi.fn().mockResolvedValue({
      response: "AI Search finds relevant chunks.",
      data: [{ id: "1" }],
    });
    const env = {
      AI: {
        autorag: vi.fn().mockReturnValue({ aiSearch }),
      } as unknown as Ai,
      INSTANCE_NAME: "demo-index",
    } satisfies Env;

    const res = await searchRoutes.fetch(
      new Request("http://localhost/search?q=what+is+ai+search"),
      env
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      answer: string;
      results: unknown[];
      instance: string;
    };
    expect(body.answer).toBe("AI Search finds relevant chunks.");
    expect(body.results).toEqual([{ id: "1" }]);
    expect(body.instance).toBe("demo-index");
    expect(aiSearch).toHaveBeenCalled();
  });

  it("returns SEARCH_ERROR when the binding throws", async () => {
    const env = {
      AI: {
        autorag: vi.fn().mockReturnValue({
          aiSearch: vi.fn().mockRejectedValue(new Error("upstream failed")),
        }),
      } as unknown as Ai,
      INSTANCE_NAME: "demo-index",
    } satisfies Env;

    const res = await searchRoutes.fetch(new Request("http://localhost/search?q=fail"), env);
    expect(res.status).toBe(502);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("SEARCH_ERROR");
  });
});
