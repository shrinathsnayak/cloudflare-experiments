import { describe, it, expect } from "vitest";
import {
  buildExtractResponse,
  calculateReadTimeMinutes,
  countWords,
  normalizeBody,
  normalizeTitle,
} from "../../src/lib/readability";

describe("countWords", () => {
  it("counts words in text", () => {
    expect(countWords("hello world")).toBe(2);
    expect(countWords("  one   two  three  ")).toBe(3);
    expect(countWords("")).toBe(0);
  });
});

describe("calculateReadTimeMinutes", () => {
  it("returns 0 for empty content", () => {
    expect(calculateReadTimeMinutes(0)).toBe(0);
  });

  it("returns at least 1 minute for non-empty content", () => {
    expect(calculateReadTimeMinutes(50)).toBe(1);
    expect(calculateReadTimeMinutes(400)).toBe(2);
  });
});

describe("normalizeBody", () => {
  it("collapses whitespace", () => {
    expect(normalizeBody("  hello   world  ")).toBe("hello world");
  });

  it("truncates long body text", () => {
    const long = "word ".repeat(20_000);
    expect(normalizeBody(long).length).toBe(50_000);
  });
});

describe("normalizeTitle", () => {
  it("trims title whitespace", () => {
    expect(normalizeTitle("  Example  ")).toBe("Example");
  });
});

describe("buildExtractResponse", () => {
  it("builds response with metrics", () => {
    const result = buildExtractResponse("https://example.com", {
      title: " Example ",
      author: " Jane Doe ",
      body: "This is a short article body.",
    });

    expect(result).toEqual({
      url: "https://example.com",
      title: "Example",
      author: "Jane Doe",
      body: "This is a short article body.",
      wordCount: 6,
      readTimeMinutes: 1,
    });
  });

  it("returns null author when missing", () => {
    const result = buildExtractResponse("https://example.com", {
      title: "Example",
      author: null,
      body: "",
    });
    expect(result.author).toBeNull();
    expect(result.wordCount).toBe(0);
    expect(result.readTimeMinutes).toBe(0);
  });
});
