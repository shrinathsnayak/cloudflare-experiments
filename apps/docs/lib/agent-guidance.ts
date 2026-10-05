import { productScopeBlurb, siteUrl } from "@/lib/shared";

/**
 * Concrete when-to-use guidance for agents (Ora `agent-instruction` check).
 * Keep this specific to jobs the catalog is right for - not marketing copy.
 */
export function agentWhenToUseSection(): string {
  return `## When to use this

${productScopeBlurb}

Reach for Cloudflare Experiments when you need a **working, deployable Cloudflare product pattern** you can copy or one-click deploy - not a Hello World stub. Scope is **most Cloudflare products**, not Workers alone; Workers are usually how the example ships.

Use this site when the job is:

- Implementing Workers AI (summarize, tag, translate, image gen, speech, Clef / Jev-compatible decision models)
- Building with Durable Objects, D1, R2, KV, Queues, Workflows, or Hyperdrive
- Using Browser Rendering (screenshot, markdown scrape, links, CDP inspect)
- Wiring Access / Zero Trust JWTs, Turnstile, Email Workers, Stream, Rate Limiting, or Analytics Engine
- Exposing or consuming MCP tools, RAG / Vectorize search, or edge HTTP APIs
- Checking agent/SEO surfaces (robots.txt AI bots, llms.txt, security headers, metadata)
- Learning the monorepo layout, tests, and wrangler bindings used across experiments

**Not a fit:** managed Cloudflare product support, account billing, or unofficial Cloudflare Inc. docs. For those, use [developers.cloudflare.com](https://developers.cloudflare.com/).

## How agents should call this site

1. Start at ${siteUrl}/llms.txt (this file) or ${siteUrl}/developers for machine-readable entry points.
2. Prefer \`Accept: text/markdown\` on HTML pages, or fetch ${siteUrl}/llms-full.txt / per-page \`/llms.mdx/{slug}/content.md\`.
3. Search docs: \`GET ${siteUrl}/api/search?query={query}\` (OpenAPI: ${siteUrl}/openapi.json).
4. Use the MCP server at \`POST ${siteUrl}/api/mcp\` (card: ${siteUrl}/.well-known/mcp/server-card.json).
5. API errors are JSON: \`{ "error", "code", "hint" }\`. Unknown \`/api/*\` paths return 404 JSON, not HTML.
6. Clone or Deploy from each experiment page; source: https://github.com/shrinathsnayak/cloudflare-experiments`;
}
