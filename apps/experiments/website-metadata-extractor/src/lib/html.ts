import type { MetadataResponse } from "../types/metadata";

function getMetaContent(html: string, nameOrProperty: string, useProperty = false): string | null {
  const attr = useProperty ? "property" : "name";
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${nameOrProperty.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]+content=["']([^"']*)["']`,
    "i"
  );
  let m = html.match(re);
  if (m) return m[1].trim() || null;
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${nameOrProperty.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
    "i"
  );
  m = html.match(re2);
  return m ? m[1].trim() || null : null;
}

function getTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/<[^>]+>/g, "").trim() || null : null;
}

function getCanonical(html: string): string | null {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  if (m) return m[1].trim();
  const m2 = html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return m2 ? m2[1].trim() : null;
}

export function extractMetadata(html: string): MetadataResponse {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const fragment = headMatch ? headMatch[1] + html : html;

  const og: MetadataResponse["og"] = {};
  const ogKeys = ["title", "description", "image", "type", "url", "site_name"] as const;
  for (const key of ogKeys) {
    const prop = key === "site_name" ? "og:site_name" : `og:${key}`;
    const v = getMetaContent(fragment, prop, true);
    if (v) (og as Record<string, string>)[key === "site_name" ? "siteName" : key] = v;
  }

  return {
    title: getTitle(fragment),
    description:
      getMetaContent(fragment, "description") ?? getMetaContent(fragment, "og:description", true),
    canonical: getCanonical(fragment),
    og,
  };
}
