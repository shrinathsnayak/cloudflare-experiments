import { describe, it, expect } from "vitest";
import { shouldReject } from "../../src/lib/policy";

describe("shouldReject", () => {
  it("rejects spam domains and subjects", () => {
    expect(shouldReject("bot@spam.example", "Hello")).toBeTruthy();
    expect(shouldReject("user@example.com", "[spam] offer")).toBeTruthy();
  });

  it("allows normal mail", () => {
    expect(shouldReject("user@example.com", "Hello")).toBe(null);
  });
});
