import { describe, it, expect } from "vitest";
import { validateCode, validateLanguage } from "../../src/lib/validate";

describe("exec validation", () => {
  it("only accepts javascript", () => {
    expect(validateLanguage("javascript")).toBe("javascript");
    expect(validateLanguage("python")).toBeNull();
    expect(validateLanguage(undefined)).toBeNull();
  });

  it("rejects empty or oversized code", () => {
    expect(validateCode("console.log(1)")).toBe("console.log(1)");
    expect(validateCode("")).toBeNull();
    expect(validateCode("   ")).toBeNull();
    expect(validateCode("x".repeat(5001))).toBeNull();
  });
});
