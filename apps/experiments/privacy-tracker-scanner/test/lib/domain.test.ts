import { describe, it, expect } from "vitest";
import { getHostname, getRegistrableDomain, isThirdParty } from "../../src/lib/domain";
import { classifyHost } from "../../src/lib/trackers";
import { validateUrl } from "../../src/lib/url";

describe("validateUrl", () => {
  it("accepts http(s) only", () => {
    expect(validateUrl("https://example.com")).toBe("https://example.com/");
    expect(validateUrl("file:///etc/passwd")).toBeNull();
    expect(validateUrl("")).toBeNull();
  });
});

describe("getHostname", () => {
  it("returns lowercase host for http(s) and null otherwise", () => {
    expect(getHostname("https://WWW.Example.com/a")).toBe("www.example.com");
    expect(getHostname("data:image/png;base64,AAA")).toBeNull();
    expect(getHostname("not a url")).toBeNull();
  });
});

describe("getRegistrableDomain", () => {
  it("handles plain, multi-level and two-part TLDs", () => {
    expect(getRegistrableDomain("example.com")).toBe("example.com");
    expect(getRegistrableDomain("a.b.example.com")).toBe("example.com");
    expect(getRegistrableDomain("www.bbc.co.uk")).toBe("bbc.co.uk");
    expect(getRegistrableDomain("shop.example.com.au")).toBe("example.com.au");
    expect(getRegistrableDomain(".google.com")).toBe("google.com");
    expect(getRegistrableDomain("192.168.1.10")).toBe("192.168.1.10");
    expect(getRegistrableDomain("localhost")).toBe("localhost");
  });
});

describe("isThirdParty", () => {
  it("compares registrable domains", () => {
    expect(isThirdParty("cdn.example.com", "example.com")).toBe(false);
    expect(isThirdParty("www.google-analytics.com", "example.com")).toBe(true);
    expect(isThirdParty("example.co.uk", "other.co.uk")).toBe(true);
  });
});

describe("classifyHost", () => {
  it("matches host suffixes and prefers the most specific entry", () => {
    expect(classifyHost("www.google-analytics.com")).toEqual({
      name: "Google Analytics",
      category: "analytics",
    });
    expect(classifyHost("connect.facebook.net")?.name).toBe("Facebook Pixel");
    expect(classifyHost("www.facebook.com")?.category).toBe("social");
    expect(classifyHost("script.hotjar.com")?.category).toBe("session-replay");
    expect(classifyHost("www.clarity.ms")?.name).toBe("Microsoft Clarity");
    expect(classifyHost("notclarity.ms")).toBeNull();
    expect(classifyHost("cdn.example.com")).toBeNull();
  });
});
