import { describe, it, expect } from "vitest";
import { validateUrl } from "../../src/lib/url";

describe("validateUrl", () => {
  it("accepts http and https", () => {
    expect(validateUrl("https://example.com")).toBe("https://example.com/");
    expect(validateUrl("http://example.com/path")).toBe("http://example.com/path");
  });

  it("rejects invalid schemes and empty", () => {
    expect(validateUrl("ftp://example.com")).toBeNull();
    expect(validateUrl("")).toBeNull();
    expect(validateUrl(undefined)).toBeNull();
  });
});
