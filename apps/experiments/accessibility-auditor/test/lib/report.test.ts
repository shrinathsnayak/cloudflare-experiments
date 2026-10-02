import { describe, it, expect } from "vitest";
import { computeScore, summarizeAxeResults, truncate } from "../../src/lib/report";
import { validateUrl } from "../../src/lib/url";
import { cleanAltText } from "../../src/lib/alt-text";

describe("validateUrl", () => {
  it("accepts http(s) and rejects other schemes", () => {
    expect(validateUrl("https://example.com")).toBe("https://example.com/");
    expect(validateUrl("ftp://example.com")).toBeNull();
    expect(validateUrl("not a url")).toBeNull();
    expect(validateUrl(undefined)).toBeNull();
  });
});

describe("truncate", () => {
  it("keeps short strings and caps long ones", () => {
    expect(truncate("abc", 5)).toBe("abc");
    expect(truncate("abcdefgh", 5)).toBe("abcd…");
  });
});

describe("computeScore", () => {
  it("returns 100 without violations and weights by impact", () => {
    expect(computeScore(40, { critical: 0, serious: 0, moderate: 0, minor: 0 })).toBe(100);
    expect(computeScore(40, { critical: 1, serious: 2, moderate: 0, minor: 0 })).toBe(67);
  });
});

describe("summarizeAxeResults", () => {
  it("counts impacts, caps nodes, truncates html and flattens shadow targets", () => {
    const nodes = Array.from({ length: 12 }, (_, i) => ({
      target: [`#el-${i}`],
      html: "x".repeat(400),
    }));
    const report = summarizeAxeResults("https://example.com/", {
      violations: [
        {
          id: "image-alt",
          impact: "critical",
          help: "Images must have alternate text",
          helpUrl: "https://dequeuniversity.com/rules/axe/4.10/image-alt",
          nodes,
        },
        {
          id: "color-contrast",
          impact: null,
          help: "Elements must meet minimum color contrast",
          helpUrl: "https://dequeuniversity.com/rules/axe/4.10/color-contrast",
          nodes: [{ target: [["my-host", "button"]], html: "<button>" }],
        },
      ],
      passes: 30,
      incomplete: 2,
    });

    expect(report.counts).toEqual({ critical: 1, serious: 0, moderate: 0, minor: 1 });
    expect(report.violations[0].totalNodes).toBe(12);
    expect(report.violations[0].nodes).toHaveLength(10);
    expect(report.violations[0].nodes[0].html).toHaveLength(300);
    expect(report.violations[1].nodes[0].target).toEqual(["my-host >>> button"]);
    expect(report.passes).toBe(30);
    expect(report.incomplete).toBe(2);
    expect(report.score).toBe(73);
  });
});

describe("cleanAltText", () => {
  it("strips quotes and 'image of' prefixes", () => {
    expect(cleanAltText('"An image of a red bicycle"')).toBe("a red bicycle");
    expect(cleanAltText("  A dog on a beach ")).toBe("A dog on a beach");
  });
});
