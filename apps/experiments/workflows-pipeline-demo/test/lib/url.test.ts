import { describe, it, expect } from "vitest";
import { validateUrl } from "../../src/lib/url";

describe("validateUrl", () => {
  it("accepts http and https URLs", () => {
    expect(validateUrl("https://example.com")).toBe("https://example.com/");
  });

  it("rejects invalid URLs", () => {
    expect(validateUrl("ftp://example.com")).toBe(null);
    expect(validateUrl("")).toBe(null);
  });
});
