import { describe, it, expect } from "vitest";
import { validateUrl, resolveUrl } from "../../src/lib/url";

describe("validateUrl", () => {
  it("accepts http and https URLs", () => {
    expect(validateUrl("https://example.com")).toBe("https://example.com/");
    expect(validateUrl("http://example.com/path")).toBe("http://example.com/path");
  });

  it("rejects missing or invalid schemes", () => {
    expect(validateUrl(undefined)).toBeNull();
    expect(validateUrl("")).toBeNull();
    expect(validateUrl("ftp://example.com")).toBeNull();
    expect(validateUrl("not-a-url")).toBeNull();
  });
});

describe("resolveUrl", () => {
  it("resolves relative hrefs", () => {
    expect(resolveUrl("https://example.com/a/b", "../c")).toBe("https://example.com/c");
  });
});
