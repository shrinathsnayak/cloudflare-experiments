import type { RobotsRules } from "../types/visibility";
import type { PageRobotSignals } from "../types/visibility";
import type { VisibilityResponse, CrawlerStatus } from "../types/visibility";
import { AI_CRAWLERS } from "../constants/crawlers";
import { isAllowedByRobots } from "./robots";
import {
  getPageRobotSignals,
  isCrawlerBlockedByPage,
  fillCrawlerSpecificBlocks,
} from "./page-signals";

const DISCLAIMER = "Configuration only; we cannot verify actual index inclusion in any AI product.";

/**
 * Combines robots.txt rules and page-level signals into a single visibility response.
 * Page-level block overrides robots allow. Robots block -> blocked. Robots allow and no page block -> allowed. Otherwise not_specified.
 */
export function buildVisibilityResponse(
  url: string,
  path: string,
  rules: RobotsRules,
  html: string,
  headers: Record<string, string>
): VisibilityResponse {
  const signals = getPageRobotSignals(html, headers);
  fillCrawlerSpecificBlocks(
    html,
    AI_CRAWLERS.map((c) => c.id),
    signals
  );

  const crawlers: VisibilityResponse["crawlers"] = [];
  const summary: VisibilityResponse["summary"] = {
    allowed: [],
    blocked: [],
    notSpecified: [],
  };

  for (const { id, platform } of AI_CRAWLERS) {
    const status = computeStatus(rules, signals, id, path);
    crawlers.push({ id, platform, status });
    if (status === "allowed") summary.allowed.push(platform);
    else if (status === "blocked") summary.blocked.push(platform);
    else summary.notSpecified.push(platform);
  }

  return {
    url,
    disclaimer: DISCLAIMER,
    crawlers,
    summary,
  };
}

function computeStatus(
  rules: RobotsRules,
  signals: PageRobotSignals,
  crawlerId: string,
  path: string
): CrawlerStatus {
  if (isCrawlerBlockedByPage(signals, crawlerId)) return "blocked";
  const robotsAllow = isAllowedByRobots(rules, crawlerId, path);
  if (robotsAllow === false) return "blocked";
  if (robotsAllow === true) return "allowed";
  return "not_specified";
}
