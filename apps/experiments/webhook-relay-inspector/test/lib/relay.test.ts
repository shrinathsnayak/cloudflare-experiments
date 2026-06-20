import { describe, it, expect } from "vitest";
import { createSessionMeta, requestStorageKey } from "../../src/lib/relay";

describe("createSessionMeta", () => {
  it("creates session metadata", () => {
    const meta = createSessionMeta("550e8400-e29b-41d4-a716-446655440000");
    expect(meta.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(meta.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("requestStorageKey", () => {
  it("prefixes request ids for storage", () => {
    expect(requestStorageKey("abc")).toBe("request:abc");
  });
});
