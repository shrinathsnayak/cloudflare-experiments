/** Cloudflare DoH JSON endpoint. */
export const DOH_BASE = "https://cloudflare-dns.com/dns-query";

/** Timeout (ms) for each DoH request. */
export const DOH_TIMEOUT_MS = 10_000;

/** Common DKIM selectors to probe. */
export const DKIM_SELECTORS = ["google", "selector1", "selector2", "default", "k1"] as const;

/** Allowed URL schemes when accepting a URL instead of a bare domain. */
export const ALLOWED_SCHEMES = ["http:", "https:"] as const;
