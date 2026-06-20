import { describe, it, expect } from "vitest";
import { normalizeLinks } from "../../src/lib/links";
import { validateUrl } from "../../src/lib/url";

describe("validateUrl", () => {
  it("returns normalized https URL", () => {
    expect(validateUrl("https://example.com/path")).toBe("https://example.com/path");
  });
});

describe("normalizeLinks", () => {
  it("deduplicates links and skips javascript URLs", () => {
    const result = normalizeLinks([
      { href: "https://example.com/a", text: "A" },
      { href: "https://example.com/a", text: "Duplicate" },
      { href: "javascript:void(0)", text: "Skip" },
      { href: "https://example.com/b", text: "B" },
    ]);

    expect(result.links).toEqual([
      { href: "https://example.com/a", text: "A" },
      { href: "https://example.com/b", text: "B" },
    ]);
    expect(result.truncated).toBe(false);
  });

  it("truncates at the max link count", () => {
    const raw = Array.from({ length: 600 }, (_, index) => ({
      href: `https://example.com/${index}`,
      text: `Link ${index}`,
    }));

    const result = normalizeLinks(raw);
    expect(result.links).toHaveLength(500);
    expect(result.truncated).toBe(true);
  });
});
