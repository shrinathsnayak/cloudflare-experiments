import { describe, it, expect } from "vitest";
import { parseBypass, validateUrl } from "../../src/lib/url";

describe("validateUrl", () => {
  it("returns null for invalid input", () => {
    expect(validateUrl(undefined)).toBe(null);
    expect(validateUrl("")).toBe(null);
    expect(validateUrl("ftp://example.com")).toBe(null);
  });

  it("returns normalized URL for http and https", () => {
    expect(validateUrl("https://example.com")).toBe("https://example.com/");
    expect(validateUrl("http://example.com/path")).toBe("http://example.com/path");
  });
});

describe("parseBypass", () => {
  it("returns false when unset", () => {
    expect(parseBypass(undefined)).toBe(false);
  });

  it("returns true for truthy values", () => {
    expect(parseBypass("1")).toBe(true);
    expect(parseBypass("true")).toBe(true);
    expect(parseBypass("yes")).toBe(true);
  });

  it("returns false for other values", () => {
    expect(parseBypass("0")).toBe(false);
    expect(parseBypass("false")).toBe(false);
  });
});
