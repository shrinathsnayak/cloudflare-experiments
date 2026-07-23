import type { RobotsRuleGroup } from "../types/inspect";

export type ParsedRobots = {
  groups: RobotsRuleGroup[];
  sitemaps: string[];
};

/**
 * Parse robots.txt into user-agent groups and sitemap URLs.
 */
export function parseRobotsTxt(text: string): ParsedRobots {
  const groups: RobotsRuleGroup[] = [];
  const sitemaps: string[] = [];
  let current: RobotsRuleGroup | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;

    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (!value && key !== "disallow" && key !== "allow") continue;

    if (key === "user-agent") {
      current = { userAgent: value, allow: [], disallow: [] };
      groups.push(current);
      continue;
    }

    if (key === "sitemap") {
      sitemaps.push(value);
      continue;
    }

    if (!current) {
      current = { userAgent: "*", allow: [], disallow: [] };
      groups.push(current);
    }

    if (key === "allow") {
      current.allow.push(value);
    } else if (key === "disallow") {
      current.disallow.push(value);
    }
  }

  return { groups, sitemaps: [...new Set(sitemaps)] };
}
