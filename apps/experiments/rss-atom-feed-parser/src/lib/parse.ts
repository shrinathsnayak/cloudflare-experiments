import { MAX_ITEMS } from "../constants/defaults";
import type { FeedItem, FeedResponse } from "../types/feed";

function decodeEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function firstTag(xml: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
  const match = re.exec(xml);
  return match ? decodeEntities(match[1]) : undefined;
}

function attr(tag: string, name: string): string | undefined {
  const re = new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i");
  const match = re.exec(tag);
  return match?.[1];
}

function collectBlocks(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>[\\s\\S]*?</${tag}>`, "gi");
  return xml.match(re) ?? [];
}

function parseRssItems(xml: string): FeedItem[] {
  return collectBlocks(xml, "item")
    .slice(0, MAX_ITEMS)
    .map((block) => {
      const linkTag = /<link(?:\s[^>]*)?>([\s\S]*?)<\/link>/i.exec(block)?.[1];
      return {
        title: firstTag(block, "title") ?? "(untitled)",
        link: linkTag ? decodeEntities(linkTag) : undefined,
        id: firstTag(block, "guid"),
        published: firstTag(block, "pubDate"),
        summary: firstTag(block, "description"),
        author: firstTag(block, "author") ?? firstTag(block, "dc:creator"),
      };
    });
}

function parseAtomItems(xml: string): FeedItem[] {
  return collectBlocks(xml, "entry")
    .slice(0, MAX_ITEMS)
    .map((block) => {
      const linkOpen = /<link\b([^>]*)\/?>/i.exec(block)?.[1] ?? "";
      const href = attr(linkOpen, "href");
      return {
        title: firstTag(block, "title") ?? "(untitled)",
        link: href,
        id: firstTag(block, "id"),
        published: firstTag(block, "published") ?? firstTag(block, "updated"),
        summary: firstTag(block, "summary") ?? firstTag(block, "content"),
        author: firstTag(block, "name"),
      };
    });
}

/**
 * Parse RSS 2.0 or Atom XML into a normalized feed response.
 */
export function parseFeedXml(url: string, xml: string): FeedResponse {
  const lower = xml.toLowerCase();
  const isAtom = lower.includes("<feed") && lower.includes("http://www.w3.org/2005/atom");
  const isRss = lower.includes("<rss") || lower.includes("<rdf:rdf") || lower.includes("<channel>");

  if (isAtom) {
    const items = parseAtomItems(xml);
    const feedLinkTag = /<link\b([^>]*)\/?>/i.exec(xml)?.[1] ?? "";
    return {
      url,
      format: "atom",
      title: firstTag(xml, "title"),
      description: firstTag(xml, "subtitle"),
      link: attr(feedLinkTag, "href"),
      itemCount: items.length,
      items,
    };
  }

  if (isRss) {
    const channel = /<channel(?:\s[^>]*)?>([\s\S]*?)<\/channel>/i.exec(xml)?.[1] ?? xml;
    const items = parseRssItems(xml);
    return {
      url,
      format: "rss",
      title: firstTag(channel, "title"),
      description: firstTag(channel, "description"),
      link: firstTag(channel, "link"),
      itemCount: items.length,
      items,
    };
  }

  return {
    url,
    format: "unknown",
    itemCount: 0,
    items: [],
  };
}
