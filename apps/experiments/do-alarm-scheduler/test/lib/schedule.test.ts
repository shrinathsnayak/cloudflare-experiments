import { describe, it, expect } from "vitest";
import { validateMessage, validateSeconds } from "../../src/lib/schedule";

describe("schedule validation", () => {
  it("validates seconds", () => {
    expect(validateSeconds(30)).toBe(30);
    expect(validateSeconds(0)).toBe(null);
    expect(validateSeconds(1000)).toBe(null);
  });

  it("validates message", () => {
    expect(validateMessage("hello")).toBe("hello");
    expect(validateMessage("")).toBe(null);
  });
});
