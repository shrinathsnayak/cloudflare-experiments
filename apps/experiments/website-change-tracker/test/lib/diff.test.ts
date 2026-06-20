import { describe, it, expect } from "vitest";
import { summarizeDiff } from "../../src/lib/diff";
import { hashContent } from "../../src/lib/hash";

describe("hashContent", () => {
  it("returns a stable sha-256 hex digest", async () => {
    const first = await hashContent("hello");
    const second = await hashContent("hello");
    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("summarizeDiff", () => {
  it("returns initial snapshot message when previous text is null", () => {
    expect(summarizeDiff(null, "hello world")).toBe("Initial snapshot");
  });

  it("reports added and removed lines", () => {
    const summary = summarizeDiff("alpha\nbeta", "alpha\ngamma");
    expect(summary).toContain("+1 line");
    expect(summary).toContain("-1 line");
    expect(summary).toContain("+ gamma");
    expect(summary).toContain("- beta");
  });

  it("reports no visible changes when normalized text matches", () => {
    expect(summarizeDiff("hello\nworld", "hello world")).toBe("No visible text changes");
  });
});
