import {
  BOOTSTRAP_CACHE_TTL_MS,
  IANA_RDAP_BOOTSTRAP_URL,
  RDAP_FALLBACK_BASE,
  RDAP_TIMEOUT_MS,
} from "../constants/defaults";
import type { RdapBootstrap, RdapDomain } from "../types/domain";
import { errorMessage, fetchJson } from "./http";

type ParsedRegistration = { expiresAt: string; registrar?: string };

let bootstrapCache: { data: RdapBootstrap; fetchedAt: number } | null = null;

export function resetBootstrapCache(): void {
  bootstrapCache = null;
}

export function findRdapServer(bootstrap: RdapBootstrap, tld: string): string | null {
  for (const [tlds, urls] of bootstrap.services ?? []) {
    if (!tlds.includes(tld)) continue;
    const url = urls.find((u) => u.startsWith("https://")) ?? urls[0];
    if (!url) return null;
    return url.endsWith("/") ? url : `${url}/`;
  }
  return null;
}

/** In-memory per isolate; isolates are short-lived so this caps IANA fetches without needing KV. */
async function getBootstrap(now: number): Promise<RdapBootstrap> {
  if (bootstrapCache && now - bootstrapCache.fetchedAt < BOOTSTRAP_CACHE_TTL_MS) {
    return bootstrapCache.data;
  }
  const data = await fetchJson<RdapBootstrap>(IANA_RDAP_BOOTSTRAP_URL, RDAP_TIMEOUT_MS);
  bootstrapCache = { data, fetchedAt: now };
  return data;
}

export function parseRdapDomain(body: RdapDomain): ParsedRegistration | null {
  const expiration = body.events?.find((e) => e.eventAction === "expiration")?.eventDate;
  if (!expiration || Number.isNaN(Date.parse(expiration))) return null;

  const registrarEntity = body.entities?.find((e) => e.roles?.includes("registrar"));
  const fn = registrarEntity?.vcardArray?.[1]?.find((prop) => prop[0] === "fn")?.[3];

  const result: ParsedRegistration = { expiresAt: new Date(expiration).toISOString() };
  if (typeof fn === "string" && fn.trim()) result.registrar = fn.trim();
  return result;
}

async function queryRdap(base: string, domain: string): Promise<ParsedRegistration> {
  const body = await fetchJson<RdapDomain>(
    `${base}domain/${domain}`,
    RDAP_TIMEOUT_MS,
    "application/rdap+json"
  );
  const parsed = parseRdapDomain(body);
  if (!parsed) throw new Error("RDAP response has no expiration event");
  return parsed;
}

export async function lookupRegistration(
  domain: string,
  now = Date.now()
): Promise<{ data: ParsedRegistration | null; error?: string }> {
  const tld = domain.split(".").pop() ?? "";
  let primaryError: string | undefined;

  try {
    const server = findRdapServer(await getBootstrap(now), tld);
    if (server) return { data: await queryRdap(server, domain) };
    primaryError = `No RDAP server listed for .${tld}`;
  } catch (error) {
    primaryError = errorMessage(error, "RDAP lookup failed");
  }

  try {
    return { data: await queryRdap(RDAP_FALLBACK_BASE, domain) };
  } catch (error) {
    return {
      data: null,
      error: `${primaryError}; fallback: ${errorMessage(error, "rdap.org lookup failed")}`,
    };
  }
}
