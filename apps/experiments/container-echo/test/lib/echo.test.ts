import { describe, it, expect } from "vitest";
import { validateMessage } from "../../src/lib/echo";

describe("echo lib", () => {
  it("validates message length", () => {
    expect(validateMessage("hi")).toBe("hi");
    expect(validateMessage("")).toBeNull();
    expect(validateMessage("x".repeat(10_001))).toBeNull();
  });
});
