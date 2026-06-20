import { describe, it, expect } from "vitest";
import { shouldSimulateFailure } from "../../src/lib/process";
import { validateJobType, validateTarget } from "../../src/lib/jobs";

describe("validateJobType", () => {
  it("accepts resize and fetch", () => {
    expect(validateJobType("resize")).toBe("resize");
    expect(validateJobType("fetch")).toBe("fetch");
  });

  it("rejects unknown types", () => {
    expect(validateJobType("unknown")).toBe(null);
  });
});

describe("validateTarget", () => {
  it("accepts non-empty strings", () => {
    expect(validateTarget("https://example.com/image.png")).toBe("https://example.com/image.png");
  });
});

describe("shouldSimulateFailure", () => {
  it("returns deterministic boolean", () => {
    expect(typeof shouldSimulateFailure("abc:1")).toBe("boolean");
    expect(shouldSimulateFailure("abc:1")).toBe(shouldSimulateFailure("abc:1"));
  });
});
