import { FETCH_TIMEOUT_MS, MAX_SAMPLE_URLS, USER_AGENT } from "../constants/defaults";
import type { SitemapResult } from "../types/inspect";

function extractTags(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>\\s*([^<]+?)\\s*</${tag}>`, "gi");
  const values: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    values.push(match[1].trim());
  }
  return values;
}

export function parseSitemapXml(xml: string): {
  type: "urlset" | "sitemapindex" | "unknown";
  urls: string[];
  childSitemaps: string[];
} {
  const lower = xml.toLowerCase();
  if (lower.includes("<sitemapindex")) {
    return {
      type: "sitemapindex",
      urls: [],
      childSitemaps: extractTags(xml, "loc"),
    };
  }
  if (lower.includes("<urlset")) {
    return {
      type: "urlset",
      urls: extractTags(xml, "loc"),
      childSitemaps: [],
    };
  }
  const locs = extractTags(xml, "loc");
  return { type: "unknown", urls: locs, childSitemaps: [] };
}

async function fetchText(
  url: string
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "application/xml,text/xml,*/*" },
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const text = await res.text();
    return { ok: true, text };
  } catch (e) {
    clearTimeout(timeoutId);
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function inspectSitemap(url: string): Promise<SitemapResult> {
  const fetched = await fetchText(url);
  if (!fetched.ok) {
    return { url, ok: false, error: fetched.error };
  }

  try {
    const parsed = parseSitemapXml(fetched.text);
    if (parsed.type === "sitemapindex") {
      return {
        url,
        ok: true,
        type: "sitemapindex",
        urlCount: parsed.childSitemaps.length,
        childSitemaps: parsed.childSitemaps.slice(0, MAX_SAMPLE_URLS),
        sampleUrls: [],
      };
    }
    return {
      url,
      ok: true,
      type: parsed.type,
      urlCount: parsed.urls.length,
      sampleUrls: parsed.urls.slice(0, MAX_SAMPLE_URLS),
    };
  } catch (e) {
    return {
      url,
      ok: false,
      error: e instanceof Error ? e.message : "Failed to parse sitemap",
    };
  }
}
