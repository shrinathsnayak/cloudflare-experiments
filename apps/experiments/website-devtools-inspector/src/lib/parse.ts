import type { DevtoolsResponse } from "../types/devtools";
import { resolveUrl } from "./url";

function getMeta(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+name=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]+content=["']([^"']*)["']`,
    "i"
  );
  const m = html.match(re);
  if (m) return m[1].trim() || null;
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
    "i"
  );
  const m2 = html.match(re2);
  return m2 ? m2[1].trim() || null : null;
}

function getTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/<[^>]+>/g, "").trim() || null : null;
}

function getCanonical(html: string): string | null {
  const m =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return m ? m[1].trim() : null;
}

function extract(html: string, tag: string, attr: string): string[] {
  const re = new RegExp(`<${tag}[^>]+${attr}=["']([^"']+)["']`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) out.push(m[1].trim());
  return [...new Set(out)];
}

function extractStylesheets(html: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const re = /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']stylesheet["']/gi;
  while ((m = re.exec(html)) !== null) out.push(m[1].trim());
  const re2 = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi;
  while ((m = re2.exec(html)) !== null) out.push(m[1].trim());
  return [...new Set(out)];
}

function extractLinks(html: string): string[] {
  const out: string[] = [];
  const re = /<a[^>]+href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = m[1].trim();
    if (href && !href.startsWith("#") && !href.startsWith("javascript:")) out.push(href);
  }
  return [...new Set(out)];
}

export function buildDevtoolsResult(
  url: string,
  html: string,
  headers: Record<string, string>,
  statusCode: number,
  responseTimeMs: number,
  cookies: string[]
): DevtoolsResponse {
  const resolve = (href: string) => resolveUrl(url, href);
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const head = headMatch ? headMatch[1] + html : html;

  return {
    url,
    statusCode,
    responseTimeMs: Math.round(responseTimeMs),
    headers,
    cookies,
    metadata: {
      title: getTitle(head),
      description: getMeta(head, "description"),
      canonical: getCanonical(head),
    },
    scripts: extract(html, "script", "src").map(resolve),
    stylesheets: extractStylesheets(html).map(resolve),
    images: extract(html, "img", "src").map(resolve),
    links: extractLinks(html).map(resolve),
  };
}
