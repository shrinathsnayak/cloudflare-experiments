export const ALLOWED_SCHEMES = ["http:", "https:"] as const;
export const DEFAULT_VIEWPORT = { width: 1280, height: 800 };
export const NAVIGATION_TIMEOUT_MS = 15_000;
/** Max request URLs kept in memory per scan. */
export const MAX_RECORDED_REQUESTS = 2_000;

/** Distinct trackers at or above this count → "heavy-tracking". */
export const HEAVY_TRACKER_THRESHOLD = 5;
/** Third-party cookies at or above this count → "heavy-tracking". */
export const HEAVY_THIRD_PARTY_COOKIE_THRESHOLD = 10;

/** Public suffixes with two labels; the registrable domain keeps one more label. */
export const TWO_PART_SUFFIXES = new Set([
  "co.uk",
  "org.uk",
  "ac.uk",
  "gov.uk",
  "me.uk",
  "ltd.uk",
  "plc.uk",
  "com.au",
  "net.au",
  "org.au",
  "edu.au",
  "gov.au",
  "co.nz",
  "org.nz",
  "co.jp",
  "ne.jp",
  "or.jp",
  "co.kr",
  "co.in",
  "net.in",
  "org.in",
  "co.za",
  "com.br",
  "com.mx",
  "com.ar",
  "com.cn",
  "com.hk",
  "com.sg",
  "com.tr",
  "com.tw",
  "co.id",
  "co.il",
  "com.my",
  "com.ph",
]);
