import { DOH_ENDPOINT, FETCH_TIMEOUT_MS } from "../constants/defaults";
import type { DnsAnswer, DnsLookupResult, DnsRecordType } from "../types/tools";

const HOSTNAME_PATTERN = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

/**
 * Accepts a bare hostname or an http(s) URL and returns the lowercase hostname,
 * or null if it is not a valid public DNS name.
 */
export function normalizeHostname(input: string): string | null {
  const trimmed = input.trim().replace(/\.$/, "");
  if (!trimmed) return null;
  let host = trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      host = new URL(trimmed).hostname;
    } catch {
      return null;
    }
  }
  return HOSTNAME_PATTERN.test(host) ? host.toLowerCase() : null;
}

interface DohResponse {
  Status: number;
  Answer?: { name: string; type: number; TTL: number; data: string }[];
}

/** Resolves a record via Cloudflare's DNS-over-HTTPS JSON API (1.1.1.1). */
export async function dnsLookup(hostname: string, type: DnsRecordType): Promise<DnsLookupResult> {
  const url = new URL(DOH_ENDPOINT);
  url.searchParams.set("name", hostname);
  url.searchParams.set("type", type);

  const res = await fetch(url.href, {
    headers: { Accept: "application/dns-json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`DNS-over-HTTPS request failed with status ${res.status}`);
  }

  const body = (await res.json()) as DohResponse;
  return {
    name: hostname,
    type,
    status: body.Status,
    answers: (body.Answer ?? []).map(
      ({ name, type: recordType, TTL, data }): DnsAnswer => ({
        name,
        type: recordType,
        ttl: TTL,
        data,
      })
    ),
  };
}
