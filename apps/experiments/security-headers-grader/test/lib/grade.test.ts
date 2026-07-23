import { describe, it, expect } from "vitest";
import { gradeHeaders, scoreToGrade } from "../../src/lib/grade";

describe("scoreToGrade", () => {
  it("maps scores to letter grades", () => {
    expect(scoreToGrade(95)).toBe("A");
    expect(scoreToGrade(85)).toBe("B");
    expect(scoreToGrade(75)).toBe("C");
    expect(scoreToGrade(65)).toBe("D");
    expect(scoreToGrade(40)).toBe("F");
  });
});

describe("gradeHeaders", () => {
  it("fails when no security headers present", () => {
    const result = gradeHeaders("https://example.com/", {});
    expect(result.grade).toBe("F");
    expect(result.score).toBe(0);
    expect(result.checks.every((c) => c.status === "missing")).toBe(true);
  });

  it("passes strong security headers", () => {
    const result = gradeHeaders("https://example.com/", {
      "strict-transport-security": "max-age=31536000; includeSubDomains",
      "content-security-policy": "default-src 'self'",
      "x-frame-options": "DENY",
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin",
      "permissions-policy": "geolocation=()",
      "cross-origin-opener-policy": "same-origin",
    });
    expect(result.grade).toBe("A");
    expect(result.score).toBe(100);
    expect(result.checks.every((c) => c.status === "pass")).toBe(true);
  });

  it("warns on weak HSTS max-age", () => {
    const result = gradeHeaders("https://example.com/", {
      "strict-transport-security": "max-age=3600",
    });
    const hsts = result.checks.find((c) => c.header === "Strict-Transport-Security");
    expect(hsts?.status).toBe("warn");
  });
});
