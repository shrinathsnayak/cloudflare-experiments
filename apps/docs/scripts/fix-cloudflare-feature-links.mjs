#!/usr/bin/env node
/**
 * Adds Cloudflare documentation links to Cloudflare Features sections.
 * Run from repo root: node apps/docs/scripts/fix-cloudflare-feature-links.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DOCS_DIR = join(import.meta.dirname, "../content/docs/experiments");

const LINKS = {
  workers: "https://developers.cloudflare.com/workers/",
  fetch: "https://developers.cloudflare.com/workers/runtime-apis/fetch/",
  edge: "https://developers.cloudflare.com/workers/reference/how-workers-works/",
  requestCf: "https://developers.cloudflare.com/workers/runtime-apis/request/#incomingrequestcfproperties",
  browser: "https://developers.cloudflare.com/browser-rendering/",
  workersAi: "https://developers.cloudflare.com/workers-ai/",
  d1: "https://developers.cloudflare.com/d1/",
  kv: "https://developers.cloudflare.com/kv/",
  r2: "https://developers.cloudflare.com/r2/",
  r2Public: "https://developers.cloudflare.com/r2/buckets/public-buckets/",
  hono: "https://hono.dev/",
  puppeteer: "https://developers.cloudflare.com/browser-rendering/platform/puppeteer/",
  queues: "https://developers.cloudflare.com/queues/",
  cron: "https://developers.cloudflare.com/workers/configuration/cron-triggers/",
};

/** @type {Record<string, string>} */
const REPLACEMENTS = {
  "is-it-down.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Edge compute runtime
- **[Fetch API](${LINKS.fetch})** - HTTP requests with timing
- **[Edge network](${LINKS.edge})** - Request metadata including data center location`,

  "whereami.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Edge compute runtime
- **[request.cf](${LINKS.requestCf})** - Incoming request metadata including geolocation`,

  "screenshot-api.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Edge compute runtime
- **[Browser Rendering](${LINKS.browser})** - Headless Chromium via Puppeteer
- **[Fetch API](${LINKS.fetch})** - Network requests within the browser`,

  "pdf-api.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Edge compute runtime
- **[Browser Rendering](${LINKS.browser})** - Headless Chromium via \`@cloudflare/puppeteer\`
- **[Puppeteer \`page.pdf()\`](${LINKS.puppeteer})** - PDF generation from rendered pages`,

  "page-metrics.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Edge compute runtime
- **[Browser Rendering](${LINKS.browser})** - Headless Chromium via \`@cloudflare/puppeteer\`
- **[Puppeteer \`page.metrics()\`](${LINKS.puppeteer})** - Page load and memory metrics`,

  "rendered-text.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Edge compute runtime
- **[Browser Rendering](${LINKS.browser})** - Headless Chromium via \`@cloudflare/puppeteer\`
- **[Puppeteer DOM evaluation](${LINKS.puppeteer})** - Extract rendered text after \`networkidle0\``,

  "cloud-ai-proxy.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Edge runtime
- **[Workers AI](${LINKS.workersAi})** - \`AI\` binding for text generation`,

  "url-dns-lookup.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Edge compute runtime
- **[Fetch API](${LINKS.fetch})** - HTTP requests to Cloudflare DoH
- **[Edge network](${LINKS.edge})** - Low-latency DNS lookups`,

  "edge-redirect-simulator.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Edge compute runtime
- **[Fetch API](${LINKS.fetch})** - HTTP requests with \`redirect: "manual"\` to capture each hop
- **[Edge network](${LINKS.edge})** - Redirect chain observed from Cloudflare's global network`,

  "ai-bot-visibility.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Serverless execution environment
- **[Fetch API](${LINKS.fetch})** - HTTP client for fetching pages and robots.txt
- **[Edge network](${LINKS.edge})** - Low-latency requests from global edge locations`,

  "link-shortener.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Serverless compute at the edge
- **[D1](${LINKS.d1})** - SQLite database at the edge (primary storage)
- **[Workers KV](${LINKS.kv})** - Key-value store (read-through cache)
- **[Hono](${LINKS.hono})** - Lightweight web framework`,

  "r2-storage.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Serverless compute at the edge
- **[R2](${LINKS.r2})** - Object storage with zero egress fees
- **[Public buckets](${LINKS.r2Public})** - Direct public access to objects
- **[Hono](${LINKS.hono})** - Lightweight web framework`,

  "task-queue.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Edge compute runtime
- **[Queues](${LINKS.queues})** - async message processing
- **[Workers KV](${LINKS.kv})** - enqueue/process statistics`,

  "cron-heartbeat.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Edge compute runtime
- **[Cron Triggers](${LINKS.cron})** - scheduled Worker invocations
- **[Workers KV](${LINKS.kv})** - persist run metadata across invocations`,

  "dependency-analyzer.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Edge compute runtime
- **[Fetch API](${LINKS.fetch})** - Remote HTML retrieval and parsing`,

  "website-metadata-extractor.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Edge compute runtime
- **[Fetch API](${LINKS.fetch})** - HTTP requests for HTML metadata extraction`,

  "website-to-api.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Edge compute runtime
- **[Fetch API](${LINKS.fetch})** - Remote HTML retrieval and structured parsing`,

  "website-to-llms-txt.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Edge compute runtime
- **[Fetch API](${LINKS.fetch})** - Remote HTML retrieval for llms.txt conversion`,

  "website-devtools-inspector.mdx": `## Cloudflare Features Used

- **[Workers](${LINKS.workers})** - Edge compute runtime
- **[Fetch API](${LINKS.fetch})** - HTTP requests for headers, HTML, and timing data`,
};

const SECTION_PATTERN =
  /^## Cloudflare Features(?: Used)?\n[\s\S]*?(?=\n## )|^## Cloudflare features used\n[\s\S]*?(?=\n## )/m;

function replaceOrInsertSection(content, replacement) {
  const match = content.match(SECTION_PATTERN);
  if (match) {
    return content.slice(0, match.index) + `${replacement}\n\n` + content.slice(match.index + match[0].length);
  }

  const useCases = content.match(/\n## Use Cases\n/);
  if (useCases?.index !== undefined) {
    return content.slice(0, useCases.index) + `\n\n${replacement}\n` + content.slice(useCases.index);
  }

  return null;
}

let updated = 0;

for (const [file, replacement] of Object.entries(REPLACEMENTS)) {
  const path = join(DOCS_DIR, file);
  const original = readFileSync(path, "utf8");
  const next = replaceOrInsertSection(original, replacement);

  if (!next) {
    console.warn(`Could not update ${file}`);
    continue;
  }

  if (next !== original) {
    writeFileSync(path, next);
    updated += 1;
    console.log(`Updated ${file}`);
  }
}

console.log(`Done. Updated ${updated}/${Object.keys(REPLACEMENTS).length} experiment docs.`);
