import { MAX_LINK_TEXT_LENGTH, MAX_LINKS } from "../constants/defaults";
import type { PageLink } from "../types/links";

export function normalizeLinks(rawLinks: PageLink[]): { links: PageLink[]; truncated: boolean } {
  const seen = new Set<string>();
  const links: PageLink[] = [];

  for (const link of rawLinks) {
    const href = link.href.trim();
    if (!href || href.startsWith("javascript:")) continue;
    if (seen.has(href)) continue;

    seen.add(href);
    links.push({
      href,
      text: link.text.trim().slice(0, MAX_LINK_TEXT_LENGTH),
    });

    if (links.length >= MAX_LINKS) {
      return { links, truncated: true };
    }
  }

  return { links, truncated: false };
}
