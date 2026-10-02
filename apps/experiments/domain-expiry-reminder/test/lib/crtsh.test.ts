import { describe, it, expect, vi, afterEach } from "vitest";
import { formatIssuer, lookupCertificate, pickLatestCertificate } from "../../src/lib/crtsh";

const NOW = Date.parse("2026-10-01T00:00:00Z");
const LE = "C=US, O=Let's Encrypt, CN=R11";

const entries = [
  {
    issuer_name: LE,
    common_name: "example.com",
    name_value: "example.com\nwww.example.com",
    not_before: "2026-08-01T00:00:00",
    not_after: "2026-10-30T23:59:59",
  },
  {
    issuer_name: LE,
    common_name: "example.com",
    name_value: "example.com",
    not_before: "2026-09-15T00:00:00",
    not_after: "2026-12-14T23:59:59",
  },
  {
    issuer_name: LE,
    common_name: "other.example.com",
    name_value: "other.example.com",
    not_before: "2026-09-20T00:00:00",
    not_after: "2027-06-01T00:00:00",
  },
  {
    issuer_name: LE,
    common_name: "example.com",
    name_value: "example.com",
    not_before: "2025-01-01T00:00:00",
    not_after: "2025-04-01T00:00:00",
  },
];

describe("pickLatestCertificate", () => {
  it("picks the latest non-expired cert for the exact name", () => {
    expect(pickLatestCertificate(entries, "example.com", NOW)).toEqual({
      expiresAt: "2026-12-14T23:59:59.000Z",
      issuer: "Let's Encrypt - R11",
    });
  });

  it("matches names in name_value", () => {
    expect(pickLatestCertificate(entries, "www.example.com", NOW)?.expiresAt).toBe(
      "2026-10-30T23:59:59.000Z"
    );
  });

  it("returns null when nothing matches", () => {
    expect(pickLatestCertificate(entries, "missing.example.com", NOW)).toBeNull();
  });
});

describe("formatIssuer", () => {
  it("falls back to the raw issuer", () => {
    expect(formatIssuer("C=US")).toBe("C=US");
    expect(formatIssuer(undefined)).toBe("unknown");
  });
});

describe("lookupCertificate", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports crt.sh failures without throwing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 502 })));
    const result = await lookupCertificate("example.com", NOW);
    expect(result.data).toBeNull();
    expect(result.error).toMatch(/^crt\.sh:/);
  });
});
