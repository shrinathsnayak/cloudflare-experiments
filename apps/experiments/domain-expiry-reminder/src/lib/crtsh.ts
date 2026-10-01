import { CRTSH_BASE, CRTSH_TIMEOUT_MS } from "../constants/defaults";
import type { CrtShEntry } from "../types/domain";
import { errorMessage, fetchJson } from "./http";

type ParsedCertificate = { expiresAt: string; issuer: string };

/** crt.sh timestamps are UTC without a zone suffix. */
function parseCrtShDate(value: string | undefined): number {
  if (!value) return Number.NaN;
  return Date.parse(/[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`);
}

export function formatIssuer(issuerName: string | undefined): string {
  if (!issuerName) return "unknown";
  const org = /(?:^|,\s*)O=("?)([^,"]+)\1/.exec(issuerName)?.[2];
  const cn = /(?:^|,\s*)CN=("?)([^,"]+)\1/.exec(issuerName)?.[2];
  return [org, cn].filter(Boolean).join(" - ") || issuerName;
}

export function pickLatestCertificate(
  entries: CrtShEntry[],
  domain: string,
  now = Date.now()
): ParsedCertificate | null {
  let best: { notAfter: number; issuer: string } | null = null;

  for (const entry of entries) {
    const names = (entry.name_value ?? "")
      .split("\n")
      .map((n) => n.trim().toLowerCase())
      .concat((entry.common_name ?? "").toLowerCase());
    if (!names.includes(domain)) continue;

    const notAfter = parseCrtShDate(entry.not_after);
    const notBefore = parseCrtShDate(entry.not_before);
    if (Number.isNaN(notAfter) || notAfter <= now) continue;
    if (!Number.isNaN(notBefore) && notBefore > now) continue;

    if (!best || notAfter > best.notAfter) {
      best = { notAfter, issuer: formatIssuer(entry.issuer_name) };
    }
  }

  return best ? { expiresAt: new Date(best.notAfter).toISOString(), issuer: best.issuer } : null;
}

export async function lookupCertificate(
  domain: string,
  now = Date.now()
): Promise<{ data: ParsedCertificate | null; error?: string }> {
  const url = `${CRTSH_BASE}?q=${encodeURIComponent(domain)}&output=json&exclude=expired`;
  try {
    const entries = await fetchJson<CrtShEntry[]>(url, CRTSH_TIMEOUT_MS);
    const data = pickLatestCertificate(Array.isArray(entries) ? entries : [], domain, now);
    return data ? { data } : { data: null, error: "No valid certificate found in CT logs" };
  } catch (error) {
    return { data: null, error: `crt.sh: ${errorMessage(error, "lookup failed")}` };
  }
}
