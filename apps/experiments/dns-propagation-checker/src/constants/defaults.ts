import type { RecordType } from "../types/dns";

/** Max time (ms) to wait for each DoH resolver. */
export const DOH_TIMEOUT_MS = 10_000;

export const ALLOWED_RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS"] as const;

export const RECORD_TYPE_IDS: Record<RecordType, number> = {
  A: 1,
  AAAA: 28,
  CNAME: 5,
  MX: 15,
  TXT: 16,
  NS: 2,
};

export const RESOLVERS = [
  { name: "cloudflare", baseUrl: "https://cloudflare-dns.com/dns-query" },
  { name: "google", baseUrl: "https://dns.google/resolve" },
  { name: "quad9", baseUrl: "https://dns.quad9.net:5053/dns-query" },
] as const;
