import { describe, it, expect } from "vitest";
import { validatePrompt } from "../../src/lib/prompt";
import { MAX_PROMPT_LENGTH } from "../../src/constants/defaults";

describe("validatePrompt", () => {
  it("rejects empty input", () => {
    expect(validatePrompt(undefined)).toBe(null);
    expect(validatePrompt("   ")).toBe(null);
  });

  it("returns trimmed prompt", () => {
    expect(validatePrompt("  a red fox  ")).toBe("a red fox");
  });

  it("rejects prompts over max length", () => {
    expect(validatePrompt("a".repeat(MAX_PROMPT_LENGTH + 1))).toBe(null);
  });

  it("accepts prompts at max length", () => {
    expect(validatePrompt("a".repeat(MAX_PROMPT_LENGTH))).toBe("a".repeat(MAX_PROMPT_LENGTH));
  });
});
