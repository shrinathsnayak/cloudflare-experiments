import { describe, it, expect } from "vitest";
import { validateMessage } from "../../src/lib/message";

describe("validateMessage", () => {
  it("accepts non-empty trimmed strings", () => {
    expect(validateMessage("  process report  ")).toBe("process report");
  });

  it("rejects empty, non-string, and oversized messages", () => {
    expect(validateMessage("")).toBeNull();
    expect(validateMessage("   ")).toBeNull();
    expect(validateMessage(42)).toBeNull();
    expect(validateMessage("a".repeat(501))).toBeNull();
  });
});
