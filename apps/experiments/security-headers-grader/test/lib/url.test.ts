import { describe, it, expect } from "vitest";
import { validateUrl } from "../../src/lib/url";

describe("validateUrl", () => {
  it("returns null for undefined", () => {
    expect(validateUrl(undefined)).toBe(null);
  });

  it("returns null for empty string", () => {
    expect(validateUrl("")).toBe(null);
    expect(validateUrl("   ")).toBe(null);
  });

  it("returns null for non-http(s) schemes", () => {
    expect(validateUrl("ftp://example.com")).toBe(null);
  });

  it("returns normalized URL for valid https", () => {
    expect(validateUrl("https://cloudflare.com")).toBe("https://cloudflare.com/");
  });
});
