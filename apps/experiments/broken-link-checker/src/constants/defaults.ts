/** Max time (ms) for the initial page fetch. */
export const PAGE_FETCH_TIMEOUT_MS = 15_000;

/** Max time (ms) per link probe. */
export const LINK_PROBE_TIMEOUT_MS = 8_000;

/** Allowed URL schemes for security. */
export const ALLOWED_SCHEMES = ["http:", "https:"] as const;

export const USER_AGENT = "Cloudflare-Experiments-BrokenLinkChecker/1.0";

/** Default max links to check. */
export const DEFAULT_LINK_LIMIT = 25;

/** Absolute max links to check. */
export const MAX_LINK_LIMIT = 50;

/** Concurrent link probes. */
export const PROBE_CONCURRENCY = 5;
