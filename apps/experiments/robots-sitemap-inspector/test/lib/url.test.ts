import { describe, it, expect } from "vitest";
import { validateUrl, originFromUrl } from "../../src/lib/url";

describe("validateUrl", () => {
  it("rejects invalid schemes", () => {
    expect(validateUrl("ftp://example.com")).toBe(null);
  });

  it("accepts https", () => {
    expect(validateUrl("https://example.com/path")).toBe("https://example.com/path");
  });
});

describe("originFromUrl", () => {
  it("returns origin", () => {
    expect(originFromUrl("https://example.com/a/b")).toBe("https://example.com");
  });
});
