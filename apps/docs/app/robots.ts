import { siteUrl } from "@/lib/shared";
import type { MetadataRoute } from "next";

/** Explicitly welcome search and AI crawlers; point them at llms.txt + sitemap. */
const aiBots = [
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "Googlebot",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "meta-externalagent",
  "FacebookBot",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      ...aiBots.map((userAgent) => ({
        userAgent,
        allow: ["/", "/llms.txt", "/llms-full.txt", "/llms.mdx/", "/docs/"],
        disallow: ["/api/"],
      })),
    ],
    // Absolute HTTPS URL only - Google ignores Host; do not emit Host with a scheme.
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
