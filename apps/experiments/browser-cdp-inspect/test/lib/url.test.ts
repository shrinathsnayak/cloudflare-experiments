import { describe, it, expect } from "vitest";
import { validateUrl } from "../../src/lib/url";

describe("validateUrl", () => {
  it("accepts http and https", () => {
    expect(validateUrl("https://example.com")).toBe("https://example.com/");
  });

  it("rejects invalid input", () => {
    expect(validateUrl("javascript:alert(1)")).toBeNull();
    expect(validateUrl(undefined)).toBeNull();
  });
});
