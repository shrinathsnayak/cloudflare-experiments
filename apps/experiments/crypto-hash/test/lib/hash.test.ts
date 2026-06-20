import { describe, it, expect } from "vitest";
import { hashText, normalizeAlgorithm, validateText } from "../../src/lib/hash";

describe("validateText", () => {
  it("rejects empty input", () => {
    expect(validateText(undefined)).toBe(null);
    expect(validateText("   ")).toBe(null);
  });

  it("returns trimmed text", () => {
    expect(validateText("  hello  ")).toBe("hello");
  });
});

describe("normalizeAlgorithm", () => {
  it("defaults to SHA-256", () => {
    expect(normalizeAlgorithm(undefined)).toBe("SHA-256");
  });

  it("accepts supported algorithms", () => {
    expect(normalizeAlgorithm("sha-384")).toBe("SHA-384");
    expect(normalizeAlgorithm("SHA512")).toBe("SHA-512");
  });

  it("rejects unsupported algorithms", () => {
    expect(normalizeAlgorithm("MD5")).toBe(null);
  });
});

describe("hashText", () => {
  it("computes SHA-256 for known input", async () => {
    const hash = await hashText("hello", "SHA-256");
    expect(hash).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });
});
