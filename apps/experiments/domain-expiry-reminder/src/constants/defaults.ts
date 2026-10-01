export const IANA_RDAP_BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json";
export const RDAP_FALLBACK_BASE = "https://rdap.org/";
export const CRTSH_BASE = "https://crt.sh/";

export const BOOTSTRAP_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const RDAP_TIMEOUT_MS = 8_000;
export const CRTSH_TIMEOUT_MS = 10_000;

/** Descending; a reminder fires for the smallest threshold that days-left has crossed. */
export const REMINDER_THRESHOLDS_DAYS = [30, 7, 1] as const;

export const DEFAULT_ALERT_FROM = "reminders@example.com";
export const USER_AGENT = "Cloudflare-Experiments-DomainExpiry/1.0";
export const MAX_DOMAIN_LENGTH = 253;
