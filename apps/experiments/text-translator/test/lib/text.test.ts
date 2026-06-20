import { describe, it, expect } from "vitest";
import { resolveSourceLang, validateLang, validateText } from "../../src/lib/text";

describe("validateText", () => {
  it("rejects empty input", () => {
    expect(validateText(undefined)).toBe(null);
    expect(validateText("   ")).toBe(null);
  });

  it("returns trimmed text", () => {
    expect(validateText("  hello  ")).toBe("hello");
  });
});

describe("validateLang", () => {
  it("accepts language codes", () => {
    expect(validateLang("es")).toBe("es");
    expect(validateLang(" EN ")).toBe("en");
  });

  it("rejects empty language codes", () => {
    expect(validateLang(undefined)).toBe(null);
    expect(validateLang("   ")).toBe(null);
  });
});

describe("resolveSourceLang", () => {
  it("defaults to en when source is omitted", () => {
    expect(resolveSourceLang(undefined)).toBe("en");
  });

  it("returns validated source when provided", () => {
    expect(resolveSourceLang("fr")).toBe("fr");
  });
});
