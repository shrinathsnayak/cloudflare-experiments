import { siteUrl } from "@/lib/shared";
import { applySecurityHeaders } from "@/lib/security-headers";

/**
 * Explicitly welcome search and AI crawlers; point them at llms.txt + sitemap.
 * Content-Signal declares post-crawl usage preferences (see https://contentsignals.org/).
 * - search=yes: index for search results
 * - ai-input=yes: allow RAG / grounding / generative answers (aligned with llms.txt)
 * - ai-train=no: do not use for model training or fine-tuning
 */
const CONTENT_SIGNAL = "ai-train=no, search=yes, ai-input=yes";

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

function userAgentBlock(userAgent: string, allowPaths: string[]): string {
  const allows = allowPaths.map((path) => `Allow: ${path}`).join("\n");
  return [
    `User-agent: ${userAgent}`,
    `Content-Signal: ${CONTENT_SIGNAL}`,
    allows,
    "Disallow: /api/",
  ].join("\n");
}

export function GET() {
  const blocks = [
    userAgentBlock("*", ["/"]),
    ...aiBots.map((bot) =>
      userAgentBlock(bot, [
        "/",
        "/llms.txt",
        "/llms-full.txt",
        "/llms.mdx/",
        "/docs/",
        "/about",
        "/contact",
        "/privacy",
        "/developers",
        "/blogs",
        "/.well-known/",
        "/openapi/",
        "/openapi.json",
      ])
    ),
  ];

  const body = `${blocks.join("\n\n")}\n\nSitemap: ${siteUrl}/sitemap.xml\n`;

  const headers = new Headers({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
  });
  applySecurityHeaders(headers);
  return new Response(body, { headers });
}
