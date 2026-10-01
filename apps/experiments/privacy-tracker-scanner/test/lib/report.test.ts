import { describe, it, expect } from "vitest";
import { buildScanReport, computeVerdict, toCookieReport } from "../../src/lib/report";

describe("computeVerdict", () => {
  it("maps tracker and cookie counts to a verdict", () => {
    expect(computeVerdict(0, 3)).toBe("clean");
    expect(computeVerdict(2, 1)).toBe("some-trackers");
    expect(computeVerdict(5, 0)).toBe("heavy-tracking");
    expect(computeVerdict(1, 10)).toBe("heavy-tracking");
  });
});

describe("toCookieReport", () => {
  it("formats expiry and flags third-party cookies", () => {
    expect(
      toCookieReport(
        {
          name: "_ga",
          domain: ".example.com",
          expires: 1_800_000_000,
          secure: true,
          httpOnly: false,
        },
        "example.com"
      )
    ).toEqual({
      name: "_ga",
      domain: ".example.com",
      expires: "2027-01-15T08:00:00.000Z",
      secure: true,
      httpOnly: false,
      sameSite: null,
      thirdParty: false,
    });
    expect(
      toCookieReport(
        {
          name: "IDE",
          domain: ".doubleclick.net",
          expires: -1,
          secure: true,
          httpOnly: true,
          sameSite: "None",
        },
        "example.com"
      )
    ).toMatchObject({ expires: null, thirdParty: true, sameSite: "None" });
  });
});

describe("buildScanReport", () => {
  it("aggregates requests, third-party domains, trackers and cookies", () => {
    const report = buildScanReport("https://example.com", {
      finalUrl: "https://www.example.com/",
      timedOut: false,
      requestUrls: [
        "https://www.example.com/",
        "https://static.example.com/app.js",
        "https://www.googletagmanager.com/gtm.js?id=GTM-1",
        "https://www.google-analytics.com/g/collect",
        "https://www.google-analytics.com/g/collect",
        "https://fonts.gstatic.com/s/inter.woff2",
        "data:image/png;base64,AAAA",
      ],
      cookies: [
        { name: "session", domain: "www.example.com", expires: -1, secure: true, httpOnly: true },
        { name: "IDE", domain: ".doubleclick.net", expires: -1, secure: true, httpOnly: true },
      ],
    });

    expect(report.firstPartyDomain).toBe("example.com");
    expect(report.requests).toEqual({ total: 6, thirdParty: 4 });
    expect(report.thirdPartyDomains[0]).toEqual({
      domain: "www.google-analytics.com",
      requests: 2,
      tracker: { name: "Google Analytics", category: "analytics" },
    });
    expect(report.thirdPartyDomains.find((d) => d.domain === "fonts.gstatic.com")).toEqual({
      domain: "fonts.gstatic.com",
      requests: 1,
    });
    expect(report.trackers.map((t) => t.name)).toEqual(["Google Analytics", "Google Tag Manager"]);
    expect(report.cookies.firstParty).toBe(1);
    expect(report.cookies.thirdParty).toBe(1);
    expect(report.verdict).toBe("some-trackers");
  });

  it("returns clean when no known trackers load", () => {
    const report = buildScanReport("https://example.com", {
      finalUrl: "https://example.com/",
      timedOut: false,
      requestUrls: ["https://example.com/"],
      cookies: [],
    });
    expect(report.verdict).toBe("clean");
    expect(report.trackers).toEqual([]);
  });
});
