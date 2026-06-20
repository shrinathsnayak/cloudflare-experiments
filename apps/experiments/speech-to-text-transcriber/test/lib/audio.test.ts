import { describe, it, expect } from "vitest";
import { toBase64Audio } from "../../src/lib/audio";

describe("toBase64Audio", () => {
  it("encodes bytes to base64", () => {
    const bytes = new TextEncoder().encode("hello");
    expect(toBase64Audio(bytes.buffer as ArrayBuffer)).toBe(btoa("hello"));
  });
});
