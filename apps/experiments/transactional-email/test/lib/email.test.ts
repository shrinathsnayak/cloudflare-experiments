import { describe, it, expect } from "vitest";
import { validateBodyField, validateEmail, validateSubject } from "../../src/lib/email";

describe("email lib", () => {
  it("validates email addresses", () => {
    expect(validateEmail("user@example.com")).toBe("user@example.com");
    expect(validateEmail("not-an-email")).toBeNull();
    expect(validateEmail("")).toBeNull();
  });

  it("validates subjects", () => {
    expect(validateSubject("Welcome")).toBe("Welcome");
    expect(validateSubject("   ")).toBeNull();
  });

  it("validates body fields", () => {
    expect(validateBodyField("Hello")).toBe("Hello");
    expect(validateBodyField("")).toBeNull();
    expect(validateBodyField(undefined)).toBeNull();
  });
});
