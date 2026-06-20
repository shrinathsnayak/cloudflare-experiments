import { describe, it, expect } from "vitest";
import { validateUrl } from "../../src/lib/url";
import { normalizeFit, parseDimension } from "../../src/lib/resize";

describe("validateUrl", () => {
  it("accepts http and https URLs", () => {
    expect(validateUrl("https://example.com/image.jpg")).toBe("https://example.com/image.jpg");
  });

  it("rejects unsupported schemes", () => {
    expect(validateUrl("ftp://example.com/image.jpg")).toBe(null);
  });
});

describe("parseDimension", () => {
  it("parses positive integers", () => {
    expect(parseDimension("800")).toBe(800);
  });

  it("rejects invalid dimensions", () => {
    expect(parseDimension("0")).toBe(null);
    expect(parseDimension("abc")).toBe(null);
  });
});

describe("normalizeFit", () => {
  it("defaults to scale-down", () => {
    expect(normalizeFit(undefined)).toBe("scale-down");
  });

  it("accepts supported fit values", () => {
    expect(normalizeFit("cover")).toBe("cover");
  });

  it("rejects unsupported fit values", () => {
    expect(normalizeFit("stretch")).toBe(null);
  });
});
