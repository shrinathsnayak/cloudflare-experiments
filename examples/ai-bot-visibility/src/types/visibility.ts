export type CrawlerStatus = "allowed" | "blocked" | "not_specified";

export type VisibilityResponse = {
  url: string;
  disclaimer: string;
  crawlers: Array<{
    id: string;
    platform: string;
    status: CrawlerStatus;
  }>;
  summary: {
    allowed: string[];
    blocked: string[];
    notSpecified: string[];
  };
};

/** Per-user-agent rules: path prefix -> allow (true) or disallow (false). */
export type RobotsRules = Map<string, Array<{ path: string; allow: boolean }>>;

/** Page-level signals: which crawlers are blocked by meta/X-Robots-Tag. */
export type PageRobotSignals = {
  /** Crawler ids that are blocked by page-level directives (noindex, noai, or crawler-specific). */
  blockedCrawlers: Set<string>;
  /** True if a generic "all bots" block (e.g. noindex, noai) applies. */
  blockAll: boolean;
};
