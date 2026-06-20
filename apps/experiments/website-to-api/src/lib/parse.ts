import type { WebsiteApiResponse } from "../types/api";
import { resolveUrl } from "./url";

function getTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/<[^>]+>/g, "").trim() || null : null;
}

function extractHeadings(html: string): { level: number; text: string }[] {
  const out: { level: number; text: string }[] = [];
  const re = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = m[2].replace(/<[^>]+>/g, "").trim();
    if (text) out.push({ level: parseInt(m[1], 10), text });
  }
  return out;
}

function extractLinks(html: string): string[] {
  const urls: string[] = [];
  const re = /<a[^>]+href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = m[1].trim();
    if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
      urls.push(href);
    }
  }
  return urls;
}

function extractImages(html: string): string[] {
  const urls: string[] = [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) urls.push(m[1].trim());
  return urls;
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function parseToStructured(html: string, baseUrl: string): WebsiteApiResponse {
  return {
    title: getTitle(html),
    headings: extractHeadings(html),
    links: unique(extractLinks(html).map((href) => resolveUrl(baseUrl, href))),
    images: unique(extractImages(html).map((href) => resolveUrl(baseUrl, href))),
  };
}
