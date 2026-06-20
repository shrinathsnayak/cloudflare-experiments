import { describe, it, expect } from "vitest";
import { parseMonitorId, validateEmail, validateUrl } from "../../src/lib/url";

describe("validateUrl", () => {
  it("accepts http and https URLs", () => {
    expect(validateUrl("https://example.com")).toBe("https://example.com/");
  });
});

describe("validateEmail", () => {
  it("accepts valid email addresses", () => {
    expect(validateEmail("Ops@Example.com")).toBe("ops@example.com");
  });

  it("rejects invalid email addresses", () => {
    expect(validateEmail("not-an-email")).toBeNull();
  });
});

describe("parseMonitorId", () => {
  it("parses positive integer ids", () => {
    expect(parseMonitorId("42")).toBe(42);
  });

  it("rejects invalid ids", () => {
    expect(parseMonitorId("0")).toBeNull();
    expect(parseMonitorId("abc")).toBeNull();
  });
});
