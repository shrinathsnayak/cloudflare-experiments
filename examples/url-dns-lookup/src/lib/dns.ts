import type { DnsLookupResponse, DohResponse } from "../types/dns";
import type { DnsRecord } from "../types/dns";
import { DOH_BASE, DNS_RECORD_TYPES, DOH_TIMEOUT_MS } from "../constants/defaults";

const RECORD_TYPE_NAMES: Record<number, string> = {
  1: "A",
  5: "CNAME",
  6: "SOA",
  15: "MX",
  16: "TXT",
  28: "AAAA",
  2: "NS",
  257: "CAA",
};

async function queryDoh(hostname: string, type: string): Promise<DohResponse | null> {
  const url = `${DOH_BASE}?name=${encodeURIComponent(hostname)}&type=${type}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DOH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/dns-json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = (await res.json()) as DohResponse;
    return json;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

function toRecord(doh: { name: string; type: number; TTL: number; data: string }): DnsRecord {
  const typeName = RECORD_TYPE_NAMES[doh.type] ?? `TYPE${doh.type}`;
  return {
    name: doh.name.replace(/\.$/, ""),
    type: typeName,
    ttl: doh.TTL,
    data: doh.data,
  };
}

/**
 * Fetches all DNS record types for the given hostname via Cloudflare DoH.
 */
export async function lookupDns(hostname: string): Promise<DnsLookupResponse> {
  const records: DnsLookupResponse["records"] = {};

  const results = await Promise.all(
    DNS_RECORD_TYPES.map(async (type) => {
      const resp = await queryDoh(hostname, type);
      return { type, resp };
    })
  );

  for (const { type, resp } of results) {
    if (resp?.Status === 0 && resp.Answer && resp.Answer.length > 0) {
      const list = resp.Answer.map(toRecord);
      records[type as keyof typeof records] = list;
    }
  }

  return { hostname, records };
}
