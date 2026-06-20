import { describe, it, expect } from "vitest";
import { validateDomain } from "../../src/lib/url";
import { validateRecordType } from "../../src/lib/record-type";

describe("validateDomain", () => {
  it("rejects invalid domains", () => {
    expect(validateDomain(undefined)).toBeNull();
    expect(validateDomain("https://example.com")).toBeNull();
    expect(validateDomain("not a domain!")).toBeNull();
  });

  it("accepts valid domains", () => {
    expect(validateDomain("example.com")).toBe("example.com");
    expect(validateDomain("api.example.com.")).toBe("api.example.com");
  });
});

describe("validateRecordType", () => {
  it("accepts supported record types", () => {
    expect(validateRecordType("a")).toBe("A");
    expect(validateRecordType("TXT")).toBe("TXT");
  });

  it("rejects unsupported record types", () => {
    expect(validateRecordType("SOA")).toBeNull();
    expect(validateRecordType("")).toBeNull();
  });
});
