import { describe, it, expect } from "vitest";
import {
  computeHmacSha256,
  parseSignature,
  timingSafeEqual,
  verifyWebhookSignature,
} from "../../src/lib/verify";

describe("parseSignature", () => {
  it("parses sha256= prefixed signatures", () => {
    expect(parseSignature("sha256=abc123")).toEqual({
      providedHex: "abc123",
      format: "prefixed-hex",
    });
  });

  it("parses raw hex signatures", () => {
    expect(parseSignature("deadbeef")).toEqual({
      providedHex: "deadbeef",
      format: "raw-hex",
    });
  });
});

describe("timingSafeEqual", () => {
  it("compares strings in constant time semantics", () => {
    expect(timingSafeEqual("abc", "abc")).toBe(true);
    expect(timingSafeEqual("abc", "abd")).toBe(false);
    expect(timingSafeEqual("abc", "abcd")).toBe(false);
  });
});

describe("verifyWebhookSignature", () => {
  it("returns match true for valid signature", async () => {
    const payload = '{"id":1}';
    const secret = "top-secret";
    const expected = await computeHmacSha256(payload, secret);
    const result = await verifyWebhookSignature({
      payload,
      secret,
      signature: `sha256=${expected}`,
    });

    expect("match" in result && result.match).toBe(true);
  });

  it("returns match false for invalid signature", async () => {
    const result = await verifyWebhookSignature({
      payload: "hello",
      secret: "secret",
      signature: "sha256=00",
    });

    expect("match" in result && result.match).toBe(false);
  });
});
