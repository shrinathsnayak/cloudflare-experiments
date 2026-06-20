import { describe, it, expect } from "vitest";
import { validateToken } from "../../src/lib/token";

describe("validateToken", () => {
  it("rejects missing or empty token", () => {
    expect(validateToken(undefined)).toBe(null);
    expect(validateToken("")).toBe(null);
    expect(validateToken("   ")).toBe(null);
    expect(validateToken(123)).toBe(null);
  });

  it("returns trimmed token", () => {
    expect(validateToken("  abc123  ")).toBe("abc123");
  });
});
