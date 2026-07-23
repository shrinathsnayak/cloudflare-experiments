/** Max time (ms) to wait for the target URL to respond. */
export const FETCH_TIMEOUT_MS = 15_000;

/** Allowed URL schemes for security. */
export const ALLOWED_SCHEMES = ["http:", "https:"] as const;

export const USER_AGENT = "Cloudflare-Experiments-SecurityHeadersGrader/1.0";

/** Points awarded per check status. */
export const SCORE_POINTS = {
  pass: 100,
  warn: 50,
  fail: 0,
  missing: 0,
} as const;
