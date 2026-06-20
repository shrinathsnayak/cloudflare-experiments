import { describe, it, expect } from "vitest";
import { normalizeMetrics } from "../../src/lib/browser";
import { validateUrl } from "../../src/lib/url";

describe("validateUrl", () => {
  it("returns normalized URL for https", () => {
    expect(validateUrl("https://example.com/path")).toBe("https://example.com/path");
  });
});

describe("normalizeMetrics", () => {
  it("rounds numeric values and drops non-finite entries", () => {
    expect(
      normalizeMetrics({
        LayoutDuration: 0.1234567,
        Nodes: 42,
        Invalid: Number.NaN,
      })
    ).toEqual({
      LayoutDuration: 0.123,
      Nodes: 42,
    });
  });
});
