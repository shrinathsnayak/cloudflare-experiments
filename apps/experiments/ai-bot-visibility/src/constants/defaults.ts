/** Max time (ms) to wait for fetch (page or robots.txt). */
export const FETCH_TIMEOUT_MS = 15_000;

/** Allowed URL schemes for security. */
export const ALLOWED_SCHEMES = ["http:", "https:"] as const;

/** Max bytes to read from a fetched HTML page. */
export const MAX_HTML_BYTES = 512 * 1024; // 512KB

/** Max bytes to read from robots.txt. */
export const MAX_ROBOTS_BYTES = 32 * 1024; // 32KB
