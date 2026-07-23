/**
 * Extract http(s) absolute and same-origin relative links from HTML.
 */
export function extractLinks(html: string, baseUrl: string): string[] {
  const hrefRe = /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  const found = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = hrefRe.exec(html)) !== null) {
    const raw = (match[1] ?? match[2] ?? match[3] ?? "").trim();
    if (
      !raw ||
      raw.startsWith("#") ||
      raw.startsWith("mailto:") ||
      raw.startsWith("tel:") ||
      raw.startsWith("javascript:")
    ) {
      continue;
    }
    try {
      const absolute = new URL(raw, baseUrl);
      if (absolute.protocol !== "http:" && absolute.protocol !== "https:") continue;
      absolute.hash = "";
      found.add(absolute.href);
    } catch {
      // ignore invalid hrefs
    }
  }

  return [...found];
}
