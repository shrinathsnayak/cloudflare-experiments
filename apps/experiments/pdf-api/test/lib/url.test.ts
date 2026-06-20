import { describe, it, expect } from "vitest";
import { validateUrl } from "../../src/lib/url";

describe("validateUrl", () => {
  it("returns null for invalid input", () => {
    expect(validateUrl(undefined)).toBe(null);
    expect(validateUrl("ftp://example.com")).toBe(null);
  });

  it("returns normalized URL for https", () => {
    expect(validateUrl("https://example.com")).toBe("https://example.com/");
  });
});
