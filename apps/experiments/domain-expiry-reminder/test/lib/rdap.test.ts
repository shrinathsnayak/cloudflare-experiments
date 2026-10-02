import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  findRdapServer,
  lookupRegistration,
  parseRdapDomain,
  resetBootstrapCache,
} from "../../src/lib/rdap";

const bootstrap = {
  services: [
    [["com", "net"], ["https://rdap.verisign.com/com/v1/"]],
    [["dev"], ["http://rdap.example/dev", "https://rdap.example/dev"]],
  ],
};

const rdapDomain = {
  events: [
    { eventAction: "registration", eventDate: "1995-08-14T04:00:00Z" },
    { eventAction: "expiration", eventDate: "2027-08-13T04:00:00Z" },
  ],
  entities: [
    {
      roles: ["registrar"],
      vcardArray: [
        "vcard",
        [
          ["version", {}, "text", "4.0"],
          ["fn", {}, "text", "Example Registrar, Inc."],
        ],
      ],
    },
  ],
};

describe("findRdapServer", () => {
  it("finds the server for a TLD", () => {
    expect(findRdapServer(bootstrap as never, "com")).toBe("https://rdap.verisign.com/com/v1/");
  });

  it("prefers https and appends a trailing slash", () => {
    expect(findRdapServer(bootstrap as never, "dev")).toBe("https://rdap.example/dev/");
  });

  it("returns null for unknown TLDs", () => {
    expect(findRdapServer(bootstrap as never, "zzz")).toBeNull();
  });
});

describe("parseRdapDomain", () => {
  it("reads the expiration event and registrar", () => {
    expect(parseRdapDomain(rdapDomain as never)).toEqual({
      expiresAt: "2027-08-13T04:00:00.000Z",
      registrar: "Example Registrar, Inc.",
    });
  });

  it("returns null without an expiration event", () => {
    expect(parseRdapDomain({ events: [{ eventAction: "registration" }] })).toBeNull();
  });
});

describe("lookupRegistration", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    resetBootstrapCache();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("queries the bootstrap server", async () => {
    fetchMock
      .mockResolvedValueOnce(Response.json(bootstrap))
      .mockResolvedValueOnce(Response.json(rdapDomain));

    const result = await lookupRegistration("example.com");
    expect(result.data?.expiresAt).toBe("2027-08-13T04:00:00.000Z");
    expect(fetchMock.mock.calls[1][0]).toBe("https://rdap.verisign.com/com/v1/domain/example.com");
  });

  it("falls back to rdap.org when the TLD server fails", async () => {
    fetchMock
      .mockResolvedValueOnce(Response.json(bootstrap))
      .mockResolvedValueOnce(new Response("nope", { status: 500 }))
      .mockResolvedValueOnce(Response.json(rdapDomain));

    const result = await lookupRegistration("example.com");
    expect(result.data?.registrar).toBe("Example Registrar, Inc.");
    expect(fetchMock.mock.calls[2][0]).toBe("https://rdap.org/domain/example.com");
  });

  it("returns an error when every source fails", async () => {
    fetchMock.mockResolvedValue(new Response("nope", { status: 404 }));
    const result = await lookupRegistration("example.zzz");
    expect(result.data).toBeNull();
    expect(result.error).toContain("fallback");
  });
});
