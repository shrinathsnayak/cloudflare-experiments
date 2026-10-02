import { describe, it, expect } from "vitest";
import { createFormId, hashIp, isAdmin } from "../../src/lib/crypto";
import { validateOrigin } from "../../src/lib/url";

describe("crypto helpers", () => {
  it("hashes IPs deterministically with a salt", async () => {
    const a = await hashIp("203.0.113.1", "salt");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(await hashIp("203.0.113.1", "salt")).toBe(a);
    expect(await hashIp("203.0.113.1", "other")).not.toBe(a);
  });

  it("checks bearer tokens", async () => {
    expect(await isAdmin("Bearer secret", "secret")).toBe(true);
    expect(await isAdmin("Bearer wrong", "secret")).toBe(false);
    expect(await isAdmin(undefined, "secret")).toBe(false);
    expect(await isAdmin("Bearer secret", undefined)).toBe(false);
  });

  it("creates 16-char form ids", () => {
    expect(createFormId()).toMatch(/^[0-9a-f]{16}$/);
  });
});

describe("validateOrigin", () => {
  it("normalizes to an origin", () => {
    expect(validateOrigin("https://Example.com/contact")).toBe("https://example.com");
    expect(validateOrigin("ftp://example.com")).toBeNull();
  });
});
