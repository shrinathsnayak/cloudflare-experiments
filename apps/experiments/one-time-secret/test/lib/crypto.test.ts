import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, generateId } from "../../src/lib/crypto";
import { fromBase64Url, toBase64Url } from "../../src/lib/encoding";
import { isValidId, isValidKey, validateSecret, validateTtl } from "../../src/lib/validate";

describe("encoding", () => {
  it("round-trips base64url", () => {
    const bytes = new Uint8Array([0, 251, 255, 62, 63]);
    const encoded = toBase64Url(bytes);
    expect(encoded).not.toMatch(/[+/=]/);
    expect(fromBase64Url(encoded)).toEqual(bytes);
  });

  it("rejects non-base64url input", () => {
    expect(fromBase64Url("abc+/")).toBeNull();
  });
});

describe("encryptSecret / decryptSecret", () => {
  it("round-trips unicode text", async () => {
    const encrypted = await encryptSecret("p@ssw0rd 🔐");
    expect(isValidKey(encrypted.key)).toBe(true);
    expect(await decryptSecret(encrypted, encrypted.key)).toBe("p@ssw0rd 🔐");
  });

  it("uses a fresh key and IV each time", async () => {
    const a = await encryptSecret("same");
    const b = await encryptSecret("same");
    expect(a.key).not.toBe(b.key);
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  it("returns null for the wrong key", async () => {
    const encrypted = await encryptSecret("hello");
    const other = await encryptSecret("other");
    expect(await decryptSecret(encrypted, other.key)).toBeNull();
  });

  it("returns null for malformed keys", async () => {
    const encrypted = await encryptSecret("hello");
    expect(await decryptSecret(encrypted, "short")).toBeNull();
  });

  it("returns null for tampered ciphertext", async () => {
    const encrypted = await encryptSecret("hello");
    const bytes = fromBase64Url(encrypted.ciphertext)!;
    bytes[0] ^= 1;
    expect(
      await decryptSecret({ ...encrypted, ciphertext: toBase64Url(bytes) }, encrypted.key)
    ).toBeNull();
  });
});

describe("validation", () => {
  it("generates valid ids", () => {
    expect(isValidId(generateId())).toBe(true);
    expect(isValidId("../etc")).toBe(false);
  });

  it("validates secrets", () => {
    expect(validateSecret("x")).toBe("x");
    expect(validateSecret("")).toBeNull();
    expect(validateSecret(42)).toBeNull();
    expect(validateSecret("x".repeat(10_001))).toBeNull();
  });

  it("validates ttlSeconds", () => {
    expect(validateTtl(undefined)).toBe(86_400);
    expect(validateTtl(60)).toBe(60);
    expect(validateTtl(604_800)).toBe(604_800);
    expect(validateTtl(59)).toBeNull();
    expect(validateTtl(604_801)).toBeNull();
    expect(validateTtl(120.5)).toBeNull();
    expect(validateTtl("3600")).toBeNull();
  });
});
