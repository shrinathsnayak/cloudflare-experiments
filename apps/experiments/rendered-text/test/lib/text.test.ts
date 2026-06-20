import { describe, it, expect } from "vitest";
import { truncateText, normalizeTitle } from "../../src/lib/text";
import { validateUrl } from "../../src/lib/url";

describe("validateUrl", () => {
  it("returns normalized URL for https", () => {
    expect(validateUrl("https://example.com")).toBe("https://example.com/");
  });
});

describe("truncateText", () => {
  it("collapses whitespace", () => {
    expect(truncateText("  hello   world  ")).toEqual({
      text: "hello world",
      truncated: false,
    });
  });

  it("truncates long text", () => {
    const long = "a".repeat(60_000);
    const result = truncateText(long);
    expect(result.truncated).toBe(true);
    expect(result.text.length).toBe(50_000);
  });
});

describe("normalizeTitle", () => {
  it("trims title whitespace", () => {
    expect(normalizeTitle("  Example  ")).toBe("Example");
  });
});
