import { MAX_BLOCKS } from "../constants/defaults";
import type { ExtractResponse, JsonLdBlock } from "../types/extract";

function collectTypes(value: unknown, out: Set<string>): void {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) collectTypes(item, out);
    return;
  }
  const obj = value as Record<string, unknown>;
  const t = obj["@type"];
  if (typeof t === "string") out.add(t);
  else if (Array.isArray(t)) {
    for (const item of t) {
      if (typeof item === "string") out.add(item);
    }
  }
  if (Array.isArray(obj["@graph"])) {
    for (const item of obj["@graph"]) collectTypes(item, out);
  }
}

/**
 * Extract application/ld+json script blocks from HTML.
 */
export function extractJsonLd(url: string, html: string): ExtractResponse {
  const re = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const blocks: JsonLdBlock[] = [];
  const allTypes = new Set<string>();
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = re.exec(html)) !== null && blocks.length < MAX_BLOCKS) {
    const raw = match[1].trim();
    try {
      const data: unknown = JSON.parse(raw);
      const types = new Set<string>();
      collectTypes(data, types);
      for (const t of types) allTypes.add(t);
      blocks.push({
        index,
        types: [...types],
        data,
      });
    } catch (e) {
      blocks.push({
        index,
        types: [],
        data: null,
        parseError: e instanceof Error ? e.message : "Invalid JSON",
      });
    }
    index += 1;
  }

  return {
    url,
    count: blocks.length,
    types: [...allTypes].sort(),
    blocks,
  };
}
