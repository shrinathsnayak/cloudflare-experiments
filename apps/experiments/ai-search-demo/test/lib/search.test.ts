import { describe, it, expect } from "vitest";
import { runSearch, validateQuery } from "../../src/lib/search";
import type { AISearchBinding } from "../../src/types/env";

describe("search lib", () => {
  it("validates queries", () => {
    expect(validateQuery("what is workers ai")).toBe("what is workers ai");
    expect(validateQuery("")).toBeNull();
    expect(validateQuery("   ")).toBeNull();
  });

  it("normalizes search responses", async () => {
    const mock: AISearchBinding = {
      async search() {
        return {
          response: "Workers run at the edge.",
          data: [{ score: 0.9, content: "Workers AI" }],
        };
      },
    };

    const result = await runSearch(mock, "what are workers", "demo-index");
    expect(result).toEqual({
      answer: "Workers run at the edge.",
      results: [{ score: 0.9, content: "Workers AI" }],
      query: "what are workers",
      instance: "demo-index",
    });
  });
});
