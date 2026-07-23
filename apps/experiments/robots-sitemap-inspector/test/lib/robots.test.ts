import { describe, it, expect } from "vitest";
import { parseRobotsTxt } from "../../src/lib/robots";
import { parseSitemapXml } from "../../src/lib/sitemap";

describe("parseRobotsTxt", () => {
  it("parses user-agent groups and sitemaps", () => {
    const parsed = parseRobotsTxt(`
User-agent: *
Disallow: /admin
Allow: /public

User-agent: Googlebot
Disallow:

Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-news.xml
`);
    expect(parsed.groups).toHaveLength(2);
    expect(parsed.groups[0].userAgent).toBe("*");
    expect(parsed.groups[0].disallow).toContain("/admin");
    expect(parsed.groups[0].allow).toContain("/public");
    expect(parsed.sitemaps).toEqual([
      "https://example.com/sitemap.xml",
      "https://example.com/sitemap-news.xml",
    ]);
  });
});

describe("parseSitemapXml", () => {
  it("parses urlset", () => {
    const xml = `<?xml version="1.0"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc></url>
  <url><loc>https://example.com/about</loc></url>
</urlset>`;
    const parsed = parseSitemapXml(xml);
    expect(parsed.type).toBe("urlset");
    expect(parsed.urls).toHaveLength(2);
  });

  it("parses sitemapindex", () => {
    const xml = `<?xml version="1.0"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://example.com/sitemap-1.xml</loc></sitemap>
</sitemapindex>`;
    const parsed = parseSitemapXml(xml);
    expect(parsed.type).toBe("sitemapindex");
    expect(parsed.childSitemaps).toEqual(["https://example.com/sitemap-1.xml"]);
  });
});
