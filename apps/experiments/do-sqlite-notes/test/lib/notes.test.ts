import { describe, it, expect } from "vitest";
import { validateContent, validateId } from "../../src/lib/notes";

describe("notes validation", () => {
  it("accepts alphanumeric ids with _ and -", () => {
    expect(validateId("user_1")).toBe("user_1");
    expect(validateId("note-abc")).toBe("note-abc");
  });

  it("rejects invalid ids", () => {
    expect(validateId("")).toBeNull();
    expect(validateId("bad id")).toBeNull();
    expect(validateId("has@symbol")).toBeNull();
  });

  it("rejects content over 4000 chars", () => {
    expect(validateContent("ok")).toBe("ok");
    expect(validateContent("x".repeat(4001))).toBeNull();
    expect(validateContent("")).toBeNull();
  });
});
