import { afterEach, describe, expect, it, vi } from "vitest";
import { dnsLookup, normalizeHostname } from "../../src/lib/dns";
import { hashText } from "../../src/lib/hash";
import { checkUptime, getHttpHeaders } from "../../src/lib/http";
import { validateUrl } from "../../src/lib/url";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("validateUrl", () => {
  it("accepts http and https", () => {
    expect(validateUrl("https://example.com")).toBe("https://example.com/");
    expect(validateUrl(" http://example.com/a ")).toBe("http://example.com/a");
  });

  it("rejects other schemes and garbage", () => {
    expect(validateUrl(undefined)).toBeNull();
    expect(validateUrl("")).toBeNull();
    expect(validateUrl("ftp://example.com")).toBeNull();
    expect(validateUrl("not a url")).toBeNull();
  });
});

describe("normalizeHostname", () => {
  it("accepts hostnames and URLs", () => {
    expect(normalizeHostname("Cloudflare.com")).toBe("cloudflare.com");
    expect(normalizeHostname("https://www.cloudflare.com/path")).toBe("www.cloudflare.com");
  });

  it("rejects invalid input", () => {
    expect(normalizeHostname("")).toBeNull();
    expect(normalizeHostname("localhost")).toBeNull();
    expect(normalizeHostname("bad host.com")).toBeNull();
  });
});

describe("dnsLookup", () => {
  it("queries DoH and maps answers", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        Status: 0,
        Answer: [{ name: "cloudflare.com", type: 1, TTL: 300, data: "104.16.132.229" }],
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await dnsLookup("cloudflare.com", "A");
    expect(result).toEqual({
      name: "cloudflare.com",
      type: "A",
      status: 0,
      answers: [{ name: "cloudflare.com", type: 1, ttl: 300, data: "104.16.132.229" }],
    });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://cloudflare-dns.com/dns-query?name=cloudflare.com&type=A");
    expect(new Headers(init.headers).get("accept")).toBe("application/dns-json");
  });

  it("throws on upstream failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 500 }))
    );
    await expect(dnsLookup("cloudflare.com", "MX")).rejects.toThrow("500");
  });
});

describe("getHttpHeaders", () => {
  it("returns status and headers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("body", { status: 200, headers: { server: "cloudflare" } }))
    );
    const result = await getHttpHeaders("https://example.com/");
    expect(result.status).toBe(200);
    expect(result.headers.server).toBe("cloudflare");
  });
});

describe("checkUptime", () => {
  it("reports up for 2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 204 }))
    );
    const result = await checkUptime("https://example.com/");
    expect(result.up).toBe(true);
    expect(result.status).toBe(204);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("reports down on network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("connection refused");
      })
    );
    const result = await checkUptime("https://example.com/");
    expect(result).toMatchObject({ up: false, status: null, error: "connection refused" });
  });
});

describe("hashText", () => {
  it("computes SHA-256 hex", async () => {
    const result = await hashText("hello", "SHA-256");
    expect(result.hex).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });

  it("supports SHA-512", async () => {
    const result = await hashText("hello", "SHA-512");
    expect(result.hex).toHaveLength(128);
  });
});
