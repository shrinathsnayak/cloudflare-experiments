import { describe, it, expect } from "vitest";
import { normalizeTag, normalizeValue, validateEvent } from "../../src/lib/event";

describe("validateEvent", () => {
  it("rejects missing or empty event", () => {
    expect(validateEvent(undefined)).toBe(null);
    expect(validateEvent("")).toBe(null);
    expect(validateEvent("   ")).toBe(null);
    expect(validateEvent(123)).toBe(null);
  });

  it("rejects events longer than 100 characters", () => {
    expect(validateEvent("a".repeat(101))).toBe(null);
  });

  it("returns trimmed event name", () => {
    expect(validateEvent("  page_view  ")).toBe("page_view");
  });
});

describe("normalizeValue", () => {
  it("defaults to 1 when value is missing or invalid", () => {
    expect(normalizeValue(undefined)).toBe(1);
    expect(normalizeValue("not-a-number")).toBe(1);
    expect(normalizeValue(Number.NaN)).toBe(1);
  });

  it("returns finite numbers", () => {
    expect(normalizeValue(42)).toBe(42);
    expect(normalizeValue(0)).toBe(0);
  });
});

describe("normalizeTag", () => {
  it("returns empty string for non-string input", () => {
    expect(normalizeTag(undefined)).toBe("");
    expect(normalizeTag(123)).toBe("");
  });

  it("trims tag strings", () => {
    expect(normalizeTag("  homepage  ")).toBe("homepage");
  });
});
