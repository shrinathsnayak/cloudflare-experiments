import { HEAVY_THIRD_PARTY_COOKIE_THRESHOLD, HEAVY_TRACKER_THRESHOLD } from "../constants/defaults";
import type {
  CookieReport,
  DetectedTracker,
  PageCapture,
  RawCookie,
  ScanReport,
  ThirdPartyDomain,
  Verdict,
} from "../types/scan";
import { getHostname, getRegistrableDomain, isThirdParty } from "./domain";
import { classifyHost } from "./trackers";

export function computeVerdict(trackerCount: number, thirdPartyCookies: number): Verdict {
  if (trackerCount === 0) return "clean";
  if (
    trackerCount >= HEAVY_TRACKER_THRESHOLD ||
    thirdPartyCookies >= HEAVY_THIRD_PARTY_COOKIE_THRESHOLD
  ) {
    return "heavy-tracking";
  }
  return "some-trackers";
}

export function toCookieReport(cookie: RawCookie, firstPartyDomain: string): CookieReport {
  return {
    name: cookie.name,
    domain: cookie.domain,
    expires: cookie.expires > 0 ? new Date(cookie.expires * 1000).toISOString() : null,
    secure: cookie.secure,
    httpOnly: cookie.httpOnly,
    sameSite: cookie.sameSite ?? null,
    thirdParty: isThirdParty(cookie.domain, firstPartyDomain),
  };
}

export function buildScanReport(url: string, capture: PageCapture): ScanReport {
  const firstPartyDomain = getRegistrableDomain(
    getHostname(capture.finalUrl) ?? getHostname(url) ?? ""
  );

  let total = 0;
  let thirdParty = 0;
  const domainCounts = new Map<string, number>();
  const trackerMap = new Map<string, DetectedTracker>();

  for (const requestUrl of capture.requestUrls) {
    const host = getHostname(requestUrl);
    if (!host) continue;
    total += 1;
    if (!isThirdParty(host, firstPartyDomain)) continue;
    thirdParty += 1;
    domainCounts.set(host, (domainCounts.get(host) ?? 0) + 1);

    const tracker = classifyHost(host);
    if (!tracker) continue;
    const existing = trackerMap.get(tracker.name);
    if (existing) {
      existing.requests += 1;
      if (!existing.domains.includes(host)) existing.domains.push(host);
    } else {
      trackerMap.set(tracker.name, { ...tracker, domains: [host], requests: 1 });
    }
  }

  const thirdPartyDomains: ThirdPartyDomain[] = [...domainCounts.entries()]
    .map(([domain, requests]) => {
      const tracker = classifyHost(domain);
      return tracker ? { domain, requests, tracker } : { domain, requests };
    })
    .sort((a, b) => b.requests - a.requests || a.domain.localeCompare(b.domain));

  const cookieList = capture.cookies.map((cookie) => toCookieReport(cookie, firstPartyDomain));
  const thirdPartyCookies = cookieList.filter((cookie) => cookie.thirdParty).length;
  const trackers = [...trackerMap.values()].sort((a, b) => b.requests - a.requests);

  return {
    url,
    finalUrl: capture.finalUrl,
    firstPartyDomain,
    timedOut: capture.timedOut,
    requests: { total, thirdParty },
    thirdPartyDomains,
    trackers,
    cookies: {
      firstParty: cookieList.length - thirdPartyCookies,
      thirdParty: thirdPartyCookies,
      list: cookieList,
    },
    verdict: computeVerdict(trackers.length, thirdPartyCookies),
  };
}
