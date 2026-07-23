/** Max time (ms) to wait for robots.txt or sitemap fetches. */
export const FETCH_TIMEOUT_MS = 15_000;

/** Allowed URL schemes for security. */
export const ALLOWED_SCHEMES = ["http:", "https:"] as const;

export const USER_AGENT = "Cloudflare-Experiments-RobotsSitemapInspector/1.0";

/** Max sitemap URLs to fetch and inspect. */
export const MAX_SITEMAPS = 5;

/** Max sample URLs returned per sitemap. */
export const MAX_SAMPLE_URLS = 10;
