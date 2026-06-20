import { DOH_TIMEOUT_MS, RECORD_TYPE_IDS, RESOLVERS } from "../constants/defaults";
import type { DohResponse, PropagationResponse, RecordType, ResolverResult } from "../types/dns";

function normalizeValue(data: string, type: RecordType): string {
  const trimmed = data.trim().replace(/\.$/, "");
  if (type === "MX") {
    const parts = trimmed.split(/\s+/);
    return parts.length > 1 ? `${parts[0]} ${parts[1].replace(/\.$/, "")}` : trimmed;
  }
  return trimmed;
}

async function queryResolver(
  resolverName: string,
  baseUrl: string,
  domain: string,
  type: RecordType
): Promise<ResolverResult> {
  const typeId = RECORD_TYPE_IDS[type];
  const url = `${baseUrl}?name=${encodeURIComponent(domain)}&type=${typeId}`;
  const started = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DOH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/dns-json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const responseTimeMs = Math.round(performance.now() - started);

    if (!res.ok) {
      return {
        resolver: resolverName,
        ok: false,
        responseTimeMs,
        values: [],
        error: `HTTP ${res.status}`,
      };
    }

    const json = (await res.json()) as DohResponse;
    if (json.Status !== 0 || !json.Answer?.length) {
      return {
        resolver: resolverName,
        ok: true,
        responseTimeMs,
        values: [],
      };
    }

    const values = [
      ...new Set(json.Answer.map((answer) => normalizeValue(answer.data, type))),
    ].sort();

    return {
      resolver: resolverName,
      ok: true,
      responseTimeMs,
      values,
    };
  } catch (err) {
    clearTimeout(timeout);
    const responseTimeMs = Math.round(performance.now() - started);
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "Request timed out"
        : err instanceof Error
          ? err.message
          : "Lookup failed";

    return {
      resolver: resolverName,
      ok: false,
      responseTimeMs,
      values: [],
      error: message,
    };
  }
}

function computeAgreement(resolvers: ResolverResult[]): {
  agreement: boolean;
  consensus: string[];
} {
  const successful = resolvers.filter((resolver) => resolver.ok);
  if (successful.length === 0) {
    return { agreement: false, consensus: [] };
  }

  const signatures = successful.map((resolver) => resolver.values.join("|"));
  const unique = [...new Set(signatures)];
  const agreement = unique.length === 1;
  const consensus = agreement ? successful[0].values : [];

  return { agreement, consensus };
}

export async function checkPropagation(
  domain: string,
  type: RecordType
): Promise<PropagationResponse> {
  const results = await Promise.all(
    RESOLVERS.map((resolver) => queryResolver(resolver.name, resolver.baseUrl, domain, type))
  );
  const { agreement, consensus } = computeAgreement(results);

  return {
    domain,
    type,
    agreement,
    consensus,
    resolvers: results,
  };
}
