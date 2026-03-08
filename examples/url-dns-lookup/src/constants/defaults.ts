/** Allowed URL schemes for extracting hostname. */
export const ALLOWED_SCHEMES = ["http:", "https:"] as const;

/** DNS record types to query via DoH. */
export const DNS_RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA", "CAA"] as const;

/** Cloudflare DoH JSON endpoint. */
export const DOH_BASE = "https://cloudflare-dns.com/dns-query";

/** Timeout (ms) for each DoH request. */
export const DOH_TIMEOUT_MS = 10_000;
