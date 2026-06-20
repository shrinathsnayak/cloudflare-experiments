import { describe, it, expect } from "vitest";
import { noteKey, parseNoteRecord, validateContent, validateNoteId } from "../../src/lib/note";

describe("validateNoteId", () => {
  it("accepts alphanumeric ids with dash and underscore", () => {
    expect(validateNoteId("hello-123")).toBe("hello-123");
  });

  it("rejects invalid ids", () => {
    expect(validateNoteId("")).toBe(null);
    expect(validateNoteId("bad id")).toBe(null);
  });
});

describe("validateContent", () => {
  it("requires non-empty content", () => {
    expect(validateContent("   ")).toBe(null);
    expect(validateContent("note body")).toBe("note body");
  });
});

describe("noteKey", () => {
  it("prefixes note ids", () => {
    expect(noteKey("abc")).toBe("note:abc");
  });
});

describe("parseNoteRecord", () => {
  it("parses stored JSON", () => {
    const raw = JSON.stringify({
      id: "abc",
      content: "hello",
      updatedAt: "2025-01-01T00:00:00.000Z",
    });
    expect(parseNoteRecord(raw, "abc")).toEqual({
      id: "abc",
      content: "hello",
      updatedAt: "2025-01-01T00:00:00.000Z",
    });
  });
});
