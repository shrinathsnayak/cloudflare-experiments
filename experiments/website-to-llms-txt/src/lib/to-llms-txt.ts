import { resolveUrl } from "./url";
import { MAX_LINKS_IN_LLMS_TXT } from "../constants/defaults";

export type KeyLink = { text: string; href: string };

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function oneLine(s: string): string {
  return s.replace(/\s+/g, " ").replace(/\n/g, " ").trim();
}

function getTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? stripHtml(m[1]) || null : null;
}

function getDescription(html: string): string | null {
  const fragment = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? html;
  const metaDesc = fragment.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
  )?.[1] ?? fragment.match(
    /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i
  )?.[1];
  if (metaDesc) return oneLine(metaDesc);
  const ogDesc = fragment.match(
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i
  )?.[1] ?? fragment.match(
    /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["']/i
  )?.[1];
  return ogDesc ? oneLine(ogDesc) : null;
}

type LinkEntry = { text: string; href: string };

function extractLinksWithText(html: string): LinkEntry[] {
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const seen = new Set<string>();
  const out: LinkEntry[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null && out.length < MAX_LINKS_IN_LLMS_TXT) {
    const href = m[1].trim();
    if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:")) continue;
    const text = stripHtml(m[2]) || href;
    const key = href.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ text, href });
  }
  return out;
}

function extractMailtoLinks(html: string): LinkEntry[] {
  const re = /<a[^>]+href=["'](mailto:[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const seen = new Set<string>();
  const out: LinkEntry[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = m[1].trim();
    const text = stripHtml(m[2]) || href;
    if (seen.has(href)) continue;
    seen.add(href);
    out.push({ text, href });
  }
  return out;
}

/**
 * Builds llms.txt body from structured data (title, description, key links, contact).
 */
export function buildLlmsTxt(
  title: string,
  description: string,
  keyLinks: KeyLink[],
  mailtos: KeyLink[],
  baseUrl: string
): string {
  const lines: string[] = [];
  lines.push(`# ${oneLine(title)}`);
  lines.push("");
  lines.push(`> ${oneLine(description)}`);
  lines.push("");

  if (keyLinks.length > 0) {
    lines.push("## Key Information");
    lines.push("");
    for (const { text, href } of keyLinks) {
      const safeText = oneLine(text).slice(0, 200).replace(/\]/g, "\\]");
      lines.push(`- [${safeText}](${href})`);
    }
    lines.push("");
  }

  lines.push("## Contact");
  lines.push("");
  if (mailtos.length > 0) {
    for (const { text, href } of mailtos) {
      const safeText = oneLine(text).replace(/\]/g, "\\]");
      lines.push(`- [${safeText}](${href})`);
    }
  } else {
    lines.push(`- Website: ${baseUrl}`);
    lines.push("- Contact details were not found on this page.");
  }

  return lines.join("\n").trimEnd() + "\n";
}

/**
 * Extracts title, description, in-page links, and mailtos from HTML.
 */
export function extractFromHtml(html: string, baseUrl: string): {
  title: string | null;
  description: string | null;
  links: KeyLink[];
  mailtos: KeyLink[];
} {
  const title = getTitle(html);
  const description = getDescription(html);
  const links = extractLinksWithText(html).map(({ text, href }) => ({
    text: oneLine(text).slice(0, 200),
    href: resolveUrl(baseUrl, href),
  }));
  const mailtos = extractMailtoLinks(html);
  return { title, description, links, mailtos };
}

/**
 * Converts HTML to llms.txt format (llms.txt spec v1.1.1 style).
 * Uses title as H1, meta/og description as blockquote, then Key Information (in-page links) and Contact.
 */
export function htmlToLlmsTxt(html: string, baseUrl: string): string {
  const { title, description, links, mailtos } = extractFromHtml(html, baseUrl);
  return buildLlmsTxt(
    title || new URL(baseUrl).hostname,
    description || `Content from ${baseUrl}.`,
    links,
    mailtos,
    baseUrl
  );
}
