export type RobotsRuleGroup = {
  userAgent: string;
  allow: string[];
  disallow: string[];
};

export type SitemapResult = {
  url: string;
  ok: boolean;
  type?: "urlset" | "sitemapindex" | "unknown";
  urlCount?: number;
  childSitemaps?: string[];
  sampleUrls?: string[];
  error?: string;
};

export type InspectResponse = {
  url: string;
  robots: {
    present: boolean;
    url: string;
    groups: RobotsRuleGroup[];
    sitemaps: string[];
    rawPreview?: string;
    error?: string;
  };
  sitemaps: SitemapResult[];
};
