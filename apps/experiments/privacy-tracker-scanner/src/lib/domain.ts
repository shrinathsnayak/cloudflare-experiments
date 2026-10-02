import { TWO_PART_SUFFIXES } from "../constants/defaults";

/** Lowercased hostname for http(s) URLs; null for data:, blob:, chrome-extension:, etc. */
export function getHostname(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isIpAddress(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":") || host.startsWith("[");
}

/**
 * eTLD+1 heuristic: last two labels, or last three when the last two are a known
 * two-part public suffix (co.uk, com.au, …). Not a full Public Suffix List lookup.
 */
export function getRegistrableDomain(host: string): string {
  const normalized = host.toLowerCase().replace(/^\.+/, "").replace(/\.$/, "");
  if (isIpAddress(normalized)) return normalized;
  const labels = normalized.split(".").filter(Boolean);
  if (labels.length <= 2) return labels.join(".");
  const lastTwo = labels.slice(-2).join(".");
  const take = TWO_PART_SUFFIXES.has(lastTwo) ? 3 : 2;
  return labels.slice(-take).join(".");
}

export function isThirdParty(host: string, firstPartyDomain: string): boolean {
  return getRegistrableDomain(host) !== firstPartyDomain;
}
