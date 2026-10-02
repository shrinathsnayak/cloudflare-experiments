import { describe, it, expect } from "vitest";
import { daysUntil, dueThreshold } from "../../src/lib/expiry";
import { validateDomain } from "../../src/lib/validate";

describe("dueThreshold", () => {
  it("returns null outside every window", () => {
    expect(dueThreshold(31)).toBeNull();
  });

  it("returns the smallest crossed threshold", () => {
    expect(dueThreshold(30)).toBe(30);
    expect(dueThreshold(8)).toBe(30);
    expect(dueThreshold(7)).toBe(7);
    expect(dueThreshold(2)).toBe(7);
    expect(dueThreshold(1)).toBe(1);
    expect(dueThreshold(-3)).toBe(1);
  });
});

describe("daysUntil", () => {
  it("floors whole days", () => {
    const now = Date.parse("2026-10-01T12:00:00Z");
    expect(daysUntil("2026-10-08T11:00:00Z", now)).toBe(6);
    expect(daysUntil("2026-09-30T12:00:00Z", now)).toBe(-1);
  });
});

describe("validateDomain", () => {
  it("accepts bare hostnames", () => {
    expect(validateDomain("Example.COM.")).toBe("example.com");
    expect(validateDomain("sub.example.co.uk")).toBe("sub.example.co.uk");
  });

  it("rejects URLs and junk", () => {
    expect(validateDomain("https://example.com")).toBeNull();
    expect(validateDomain("example.com/path")).toBeNull();
    expect(validateDomain("localhost")).toBeNull();
    expect(validateDomain("-bad.com")).toBeNull();
    expect(validateDomain(42)).toBeNull();
  });
});
