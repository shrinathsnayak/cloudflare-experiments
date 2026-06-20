import { describe, it, expect } from "vitest";
import { validateText } from "../../src/lib/text";
import { validateId } from "../../src/lib/id";
import { parseTopK } from "../../src/lib/topk";

describe("validateText", () => {
  it("rejects empty input", () => {
    expect(validateText(undefined)).toBe(null);
    expect(validateText("   ")).toBe(null);
  });

  it("returns trimmed text", () => {
    expect(validateText("  edge workers  ")).toBe("edge workers");
  });
});

describe("validateId", () => {
  it("rejects empty input", () => {
    expect(validateId(undefined)).toBe(null);
    expect(validateId("   ")).toBe(null);
  });

  it("returns trimmed id", () => {
    expect(validateId("  doc-1  ")).toBe("doc-1");
  });
});

describe("parseTopK", () => {
  it("defaults to 5 when omitted", () => {
    expect(parseTopK(undefined)).toBe(5);
    expect(parseTopK("")).toBe(5);
  });

  it("accepts values between 1 and 20", () => {
    expect(parseTopK("1")).toBe(1);
    expect(parseTopK("20")).toBe(20);
  });

  it("rejects out-of-range values", () => {
    expect(parseTopK("0")).toBe(null);
    expect(parseTopK("21")).toBe(null);
    expect(parseTopK("abc")).toBe(null);
  });
});
