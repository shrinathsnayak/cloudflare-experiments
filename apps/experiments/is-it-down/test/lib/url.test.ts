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
    expect(validateUrl("file:///tmp/x")).toBe(null);
    expect(validateUrl("javascript:void(0)")).toBe(null);
  });

  it("returns normalized URL for valid http", () => {
    expect(validateUrl("http://example.com")).toBe("http://example.com/");
    expect(validateUrl("http://example.com/path")).toBe("http://example.com/path");
  });

  it("returns normalized URL for valid https", () => {
    expect(validateUrl("https://cloudflare.com")).toBe("https://cloudflare.com/");
    expect(validateUrl("https://cloudflare.com?q=1")).toBe("https://cloudflare.com/?q=1");
  });

  it("trims whitespace", () => {
    expect(validateUrl("  https://cloudflare.com  ")).toBe("https://cloudflare.com/");
  });

  it("returns null for invalid URL", () => {
    expect(validateUrl("not a url")).toBe(null);
    expect(validateUrl("http://")).toBe(null);
  });
});
