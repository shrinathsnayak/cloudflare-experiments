import type { RobotsRules } from "../types/visibility";

/**
 * Parses robots.txt content into per-user-agent rules.
 * Only processes User-agent, Allow, and Disallow. Case-insensitive.
 * Each UA can have multiple path rules; order is preserved for same-path resolution
 * (Google: most specific match wins; if same length, Allow wins).
 */
export function parseRobotsTxt(content: string): RobotsRules {
  const rules: RobotsRules = new Map();
  const lines = content.split(/\r?\n/).map((l) => l.trim());
  let currentUas: string[] = [];

  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (key === "user-agent") {
      currentUas = value ? [value.toLowerCase()] : [];
      continue;
    }
    if (key !== "allow" && key !== "disallow") continue;
    if (!value) {
      // Empty Disallow = allow all; empty Allow = allow (no effect)
      if (key === "disallow") continue;
      if (key === "allow") {
        for (const ua of currentUas) {
          appendRule(rules, ua, "/", true);
        }
        continue;
      }
    }
    const path = value.startsWith("/") ? value : `/${value}`;
    const allow = key === "allow";
    for (const ua of currentUas) {
      appendRule(rules, ua, path, allow);
    }
  }

  return rules;
}

function appendRule(
  rules: RobotsRules,
  ua: string,
  path: string,
  allow: boolean
): void {
  const list = rules.get(ua) ?? [];
  list.push({ path, allow });
  rules.set(ua, list);
}

/**
 * Returns true if the path is allowed, false if disallowed, null if no rule
 * applies for this crawler. Matches crawler to rules by case-insensitive
 * User-agent match (e.g. GPTBot matches "gptbot"). Path must start with /.
 * Longest matching path wins; if same length, Allow wins (Google behavior).
 */
export function isAllowedByRobots(
  rules: RobotsRules,
  crawlerId: string,
  path: string
): boolean | null {
  const uaKey = crawlerId.toLowerCase();
  const pathNormalized = path.startsWith("/") ? path : `/${path}`;

  // Check crawler-specific rules first
  let list = rules.get(uaKey) ?? [];
  // Also check * if present
  const starList = rules.get("*") ?? [];
  list = [...list, ...starList];
  if (list.length === 0) return null;

  let bestLength = -1;
  let bestAllow: boolean | null = null;

  for (const { path: rulePath, allow } of list) {
    if (rulePath === "" && !allow) continue;
    const matches =
      pathNormalized === rulePath ||
      (rulePath.length > 0 &&
        pathNormalized.startsWith(rulePath) &&
        (rulePath.endsWith("/") || pathNormalized.length === rulePath.length || pathNormalized[rulePath.length] === "/"));
    if (!matches) continue;
    const len = rulePath.length;
    if (len > bestLength) {
      bestLength = len;
      bestAllow = allow;
    } else if (len === bestLength && bestAllow !== null) {
      // Same length: Allow wins (Google spec)
      bestAllow = allow;
    }
  }

  if (bestAllow === null) return null;
  return bestAllow;
}
