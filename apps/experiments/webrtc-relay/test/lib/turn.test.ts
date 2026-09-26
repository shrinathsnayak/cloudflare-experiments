import { describe, it, expect } from "vitest";
import { demoCredentials, isConfigured, parseTtl } from "../../src/lib/turn";

describe("parseTtl", () => {
  it("defaults and accepts valid range", () => {
    expect(parseTtl(undefined)).toBe(86400);
    expect(parseTtl("3600")).toBe(3600);
  });

  it("rejects out of range", () => {
    expect(parseTtl("59")).toBeNull();
    expect(parseTtl("86401")).toBeNull();
    expect(parseTtl("abc")).toBeNull();
  });
});

describe("isConfigured / demoCredentials", () => {
  it("detects missing config", () => {
    expect(isConfigured("", "token")).toBe(false);
    expect(isConfigured("key", undefined)).toBe(false);
    expect(isConfigured("key", "token")).toBe(true);
  });

  it("returns demo shape", () => {
    const demo = demoCredentials(3600);
    expect(demo.mode).toBe("demo");
    expect(demo.ttl).toBe(3600);
    expect(demo.note).toBeDefined();
    expect(demo.iceServers[0]?.username).toBe("demo");
  });
});
