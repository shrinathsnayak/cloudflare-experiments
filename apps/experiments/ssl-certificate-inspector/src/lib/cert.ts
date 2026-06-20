import type { CertificateInfo } from "../types/env";
import { daysUntil, uniqueSans } from "./domain";

type CrtShEntry = {
  issuer_name?: string;
  common_name?: string;
  name_value?: string;
  not_before?: string;
  not_after?: string;
  serial_number?: string;
};

export async function fetchCertificateFromCt(domain: string): Promise<CertificateInfo | null> {
  const url = `https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`;
  const response = await fetch(url, {
    headers: { "User-Agent": "cloudflare-experiments/ssl-certificate-inspector" },
  });
  if (!response.ok) {
    throw new Error(`Certificate lookup failed with status ${response.status}`);
  }

  const entries = (await response.json()) as CrtShEntry[];
  if (!entries.length) return null;

  const latest = entries
    .filter((entry) => entry.not_after)
    .sort((a, b) => Date.parse(b.not_after ?? "") - Date.parse(a.not_after ?? ""))[0];

  if (!latest?.not_after || !latest.not_before) return null;

  const san = uniqueSans(
    entries
      .flatMap((entry) => (entry.name_value ?? "").split("\n"))
      .filter((name) => name.includes(domain) || name.startsWith("*."))
  );

  return {
    issuer: latest.issuer_name ?? "unknown",
    subject: latest.common_name ?? domain,
    notBefore: latest.not_before,
    notAfter: latest.not_after,
    daysUntilExpiry: daysUntil(latest.not_after),
    san: san.length ? san.slice(0, 50) : [domain],
    serialNumber: latest.serial_number,
  };
}

export async function probeHttps(
  domain: string
): Promise<{ reachable: boolean; tlsVersion?: string }> {
  try {
    const response = await fetch(`https://${domain}`, {
      method: "HEAD",
      redirect: "follow",
    });
    const tlsVersion = (response as unknown as { cf?: { tlsVersion?: string } }).cf?.tlsVersion;
    return { reachable: response.ok || response.status < 500, tlsVersion };
  } catch {
    return { reachable: false };
  }
}
