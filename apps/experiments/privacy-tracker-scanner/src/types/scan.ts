export type TrackerCategory = "analytics" | "advertising" | "social" | "session-replay";

export type TrackerDefinition = {
  /** Hostname suffix: matches the host itself and any subdomain. */
  domain: string;
  name: string;
  category: TrackerCategory;
};

export type TrackerInfo = {
  name: string;
  category: TrackerCategory;
};

export type RawCookie = {
  name: string;
  domain: string;
  /** Unix seconds; negative for session cookies (CDP convention). */
  expires: number;
  secure: boolean;
  httpOnly: boolean;
  sameSite?: "Strict" | "Lax" | "None";
};

export type PageCapture = {
  finalUrl: string;
  requestUrls: string[];
  cookies: RawCookie[];
  timedOut: boolean;
};

export type ThirdPartyDomain = {
  domain: string;
  requests: number;
  tracker?: TrackerInfo;
};

export type DetectedTracker = TrackerInfo & {
  domains: string[];
  requests: number;
};

export type CookieReport = {
  name: string;
  domain: string;
  expires: string | null;
  secure: boolean;
  httpOnly: boolean;
  sameSite: "Strict" | "Lax" | "None" | null;
  thirdParty: boolean;
};

export type Verdict = "clean" | "some-trackers" | "heavy-tracking";

export type ScanReport = {
  url: string;
  finalUrl: string;
  firstPartyDomain: string;
  timedOut: boolean;
  requests: { total: number; thirdParty: number };
  thirdPartyDomains: ThirdPartyDomain[];
  trackers: DetectedTracker[];
  cookies: { firstParty: number; thirdParty: number; list: CookieReport[] };
  verdict: Verdict;
};
