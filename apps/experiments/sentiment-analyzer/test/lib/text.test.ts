import { describe, it, expect } from "vitest";
import { validateText } from "../../src/lib/text";

describe("validateText", () => {
  it("rejects empty input", () => {
    expect(validateText(undefined)).toBe(null);
    expect(validateText("   ")).toBe(null);
  });

  it("returns trimmed text", () => {
    expect(validateText("  great pizza  ")).toBe("great pizza");
  });
});
