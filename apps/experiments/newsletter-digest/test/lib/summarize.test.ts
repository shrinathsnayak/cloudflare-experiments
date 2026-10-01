import { describe, it, expect, vi } from "vitest";
import { fallbackSummary, summarizeNewsletter } from "../../src/lib/summarize";
import type { AiBinding } from "../../src/types/env";

describe("summarizeNewsletter", () => {
  it("normalizes AI bullets to at most three", async () => {
    const ai: AiBinding = {
      run: vi.fn().mockResolvedValue({
        response: "Here are the points:\n* One\n2. Two\n- Three\n- Four",
      }),
    };
    const result = await summarizeNewsletter(ai, "Subject", "Body text");
    expect(result).toEqual({ summary: "- One\n- Two\n- Three", usedAi: true });
    expect(vi.mocked(ai.run).mock.calls[0][0]).toBe("@cf/meta/llama-3.1-8b-instruct-fast");
  });

  it("falls back to the first 300 chars when AI fails", async () => {
    const ai: AiBinding = { run: vi.fn().mockRejectedValue(new Error("AI down")) };
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const text = "word ".repeat(100);
    const result = await summarizeNewsletter(ai, "Subject", text);
    expect(result.usedAi).toBe(false);
    expect(result.summary.length).toBeLessThanOrEqual(301);
    expect(result.summary.endsWith("…")).toBe(true);
  });

  it("falls back when the AI response is empty", async () => {
    const ai: AiBinding = { run: vi.fn().mockResolvedValue({ response: "" }) };
    expect((await summarizeNewsletter(ai, "S", "short body")).summary).toBe("short body");
  });
});

describe("fallbackSummary", () => {
  it("keeps short text intact", () => {
    expect(fallbackSummary("  a\n b ")).toBe("a b");
  });
});
