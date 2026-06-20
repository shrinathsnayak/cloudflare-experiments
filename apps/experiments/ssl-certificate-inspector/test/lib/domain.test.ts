import { describe, it, expect } from "vitest";
import { validateDomain, daysUntil } from "../../src/lib/domain";

describe("validateDomain", () => {
  it("accepts valid hostnames", () => {
    expect(validateDomain("example.com")).toBe("example.com");
  });

  it("rejects invalid hostnames", () => {
    expect(validateDomain("not a domain")).toBe(null);
    expect(validateDomain("")).toBe(null);
  });
});

describe("daysUntil", () => {
  it("computes days from now", () => {
    const future = new Date(Date.now() + 10 * 86400000).toISOString();
    expect(daysUntil(future)).toBeGreaterThanOrEqual(9);
  });
});
