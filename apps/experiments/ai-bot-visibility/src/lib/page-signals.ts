import type { PageRobotSignals } from "../types/visibility";

const BLOCK_TOKENS = ["noindex", "noai", "none"];

/**
 * Extracts content of <meta name="robots" content="..."> (or name="googlebot" etc.).
 * Uses regex to find first match; order of attributes may vary.
 */
function getMetaContent(html: string, name: string): string | null {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']*)["']`, "i");
  let m = html.match(re);
  if (m) return m[1].trim() || null;
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${escaped}["']`, "i");
  m = html.match(re2);
  return m ? m[1].trim() || null : null;
}

function parseTokens(content: string): Set<string> {
  const tokens = new Set<string>();
  for (const part of content.split(/[\s,]+/)) {
    const t = part.trim().toLowerCase();
    if (t) tokens.add(t);
  }
  return tokens;
}

function hasBlockDirective(tokens: Set<string>): boolean {
  return BLOCK_TOKENS.some((t) => tokens.has(t));
}

/**
 * Builds page-level robot signals from HTML and response headers.
 * - meta name="robots" and X-Robots-Tag: noindex, noai, none -> block all crawlers.
 * - meta name="{crawler-id}" (e.g. name="gptbot"): noindex/noai/none -> block that crawler.
 */
export function getPageRobotSignals(
  html: string,
  headers: Record<string, string>
): PageRobotSignals {
  const blockedCrawlers = new Set<string>();
  let blockAll = false;

  const robotsContent = getMetaContent(html, "robots");
  if (robotsContent) {
    const tokens = parseTokens(robotsContent);
    if (hasBlockDirective(tokens)) blockAll = true;
  }

  const xRobotsTag = headers["x-robots-tag"];
  if (xRobotsTag) {
    const tokens = parseTokens(xRobotsTag);
    if (hasBlockDirective(tokens)) blockAll = true;
  }

  return {
    blockedCrawlers,
    blockAll,
  };
}

/**
 * Returns whether the given crawler is blocked by page-level signals.
 * Pass the crawler id (e.g. GPTBot) and the result of getPageRobotSignals.
 * If blockAll is true, all crawlers are considered blocked; otherwise only
 * those in blockedCrawlers (from crawler-specific meta) are blocked.
 */
export function isCrawlerBlockedByPage(signals: PageRobotSignals, crawlerId: string): boolean {
  if (signals.blockAll) return true;
  const key = crawlerId.toLowerCase();
  return signals.blockedCrawlers.has(key);
}

/**
 * Fills blockedCrawlers from crawler-specific meta tags (e.g. <meta name="gptbot" content="noindex">).
 * Call this with the list of crawler ids we care about; for each, check meta name="{id}" and add to blockedCrawlers if noindex/noai/none.
 */
export function fillCrawlerSpecificBlocks(
  html: string,
  crawlerIds: string[],
  signals: PageRobotSignals
): void {
  for (const id of crawlerIds) {
    const content = getMetaContent(html, id);
    if (!content) continue;
    const tokens = parseTokens(content);
    if (hasBlockDirective(tokens)) signals.blockedCrawlers.add(id.toLowerCase());
  }
}
