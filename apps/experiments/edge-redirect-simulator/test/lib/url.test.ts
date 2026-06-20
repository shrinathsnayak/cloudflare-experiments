import { describe, it, expect } from "vitest";
import { validateUrl } from "../../src/lib/url";

describe("validateUrl", () => {
  it("returns null for empty or undefined", () => {
    expect(validateUrl(undefined)).toBeNull();
    expect(validateUrl("")).toBeNull();
    expect(validateUrl("   ")).toBeNull();
  });

  it("accepts https URL", () => {
    expect(validateUrl("https://cloudflare.com")).toBe("https://cloudflare.com/");
  });

  it("accepts http URL", () => {
    expect(validateUrl("http://example.com")).toBe("http://example.com/");
  });

  it("adds https when scheme omitted", () => {
    expect(validateUrl("example.com")).toBe("https://cloudflare.com/");
  });

  it("returns null for javascript: and other schemes", () => {
    expect(validateUrl("javascript:alert(1)")).toBeNull();
    expect(validateUrl("ftp://example.com")).toBeNull();
  });
});
