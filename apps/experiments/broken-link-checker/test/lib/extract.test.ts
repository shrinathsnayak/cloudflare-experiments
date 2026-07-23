import { describe, it, expect } from "vitest";
import { extractLinks } from "../../src/lib/extract";
import { parseLimit, validateUrl } from "../../src/lib/url";

describe("extractLinks", () => {
  it("extracts absolute and relative http(s) links", () => {
    const html = `
      <a href="https://example.com/a">A</a>
      <a href='/b'>B</a>
      <a href="#frag">skip</a>
      <a href="mailto:x@y.com">skip</a>
      <a href="javascript:void(0)">skip</a>
    `;
    const links = extractLinks(html, "https://example.com/page");
    expect(links).toContain("https://example.com/a");
    expect(links).toContain("https://example.com/b");
    expect(links).toHaveLength(2);
  });
});

describe("parseLimit", () => {
  it("defaults and clamps", () => {
    expect(parseLimit(undefined)).toBe(25);
    expect(parseLimit("10")).toBe(10);
    expect(parseLimit("999")).toBe(50);
  });
});

describe("validateUrl", () => {
  it("rejects non-http", () => {
    expect(validateUrl("ftp://x.com")).toBe(null);
  });
});
