#!/usr/bin/env node
/**
 * Ensures every experiment doc has Use Cases and Limitations sections.
 * Run from repo root: node apps/docs/scripts/add-use-cases-limitations.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DOCS_DIR = join(import.meta.dirname, "../content/docs/experiments");

/** @type {Record<string, { useCases?: string[]; limitations: string[] }>} */
const CONTENT = {
  "ai-bot-visibility": { limitations: [] },
  "ai-image-generator": {
    limitations: [
      "Workers AI image generation is subject to [usage limits](https://developers.cloudflare.com/workers-ai/platform/limits/) by plan",
      "Fixed model and parameters; no style, size, or batch controls in this experiment",
      "Returns a single PNG per request; no async jobs or storage",
      "Public endpoint with no authentication or rate limiting",
    ],
  },
  "ai-website-summary": { limitations: [] },
  "ai-website-tag-generator": { limitations: [] },
  "analytics-engine": {
    limitations: [
      "Writes datapoints only; no query or dashboard API in this experiment",
      "No sampling, aggregation, or retention configuration",
      "Requires an Analytics Engine binding in `wrangler.json`",
    ],
  },
  "browser-links": {
    limitations: [
      "Requires Browser Rendering enabled on your Cloudflare account",
      "Local development needs `npx wrangler dev --remote` to reach a real browser",
      "Fixed 1280×800 viewport and navigation timeout",
      "Single URL per request; no multi-page crawling",
    ],
  },
  "cloud-ai-proxy": {
    useCases: [
      "Try Workers AI models from curl, Postman, or external tools without managing bindings",
      "Prototype chat APIs before adding authentication and rate limiting",
      "Compare model outputs by swapping the `model` parameter",
      "Integrate edge AI into apps via a simple HTTP proxy",
    ],
    limitations: [
      "Public endpoint with no authentication or rate limiting by default",
      "Workers AI is subject to [usage limits](https://developers.cloudflare.com/workers-ai/platform/limits/) by plan",
      "`max_tokens` is capped at 4096",
      "Text generation only; no streaming responses or tool calling",
    ],
  },
  "cron-heartbeat": {
    limitations: [
      "Cron schedule is fixed in `wrangler.json`; change and redeploy to adjust timing",
      "Stores last-run metadata in KV only; not a full job scheduler",
      "Demonstration worker; no alerting or retry logic on failed runs",
    ],
  },
  "crypto-hash": {
    limitations: [
      "Hashes plain text only; no file upload or streaming input",
      "No HMAC, salting, or keyed hashing in this experiment",
      "Input size is limited by Worker memory and request limits",
    ],
  },
  "dependency-analyzer": {
    limitations: [
      "Static HTML only; assets loaded dynamically by JavaScript are not detected",
      "HTML body is capped before parsing",
      "Fetch timeout on slow or unreachable origins",
      "Single URL per request; no site-wide crawling",
    ],
  },
  "durable-counter": {
    limitations: [
      "Demo uses a single global counter via `idFromName()`; not sharded for high throughput",
      "Requires a Durable Objects binding and migration",
      "No authentication; any client can increment or read the counter",
    ],
  },
  "edge-cache": {
    limitations: [
      "Uses the default cache with no custom TTL or cache-key logic in this demo",
      "Cache is per-colo; entries are not globally consistent",
      "Only caches successful GET fetch responses for the requested URL",
    ],
  },
  "edge-redirect-simulator": {
    limitations: [
      "Stops after 20 redirects to prevent infinite loops",
      "Does not follow meta refresh or JavaScript-based redirects",
      "Fetch timeout applies per hop on slow origins",
      "Reports redirect chain from the edge; results may differ from a browser",
    ],
  },
  "github-repo-explainer": { limitations: [] },
  "html-rewriter": {
    limitations: [
      "Static HTML fetch only; JavaScript-rendered content is not executed",
      "HTML body size is capped before streaming through HTMLRewriter",
      "Single URL per request; no multi-page crawling",
      "Fetch timeout on slow origins",
    ],
  },
  "image-resizer": {
    limitations: [
      "Remote image fetch is subject to a timeout",
      "Resizing options are limited to the query params exposed by this experiment",
      "Origin must allow Cloudflare to fetch the image URL",
      "Single image per request; no batch processing",
    ],
  },
  "is-it-down": {
    limitations: [
      "Checks from the edge colo serving the request, not from every region globally",
      "Fetch timeout may mark slow but reachable sites as down",
      "HTTP reachability only; no SSL certificate or DNS health checks",
    ],
  },
  "kv-notes": {
    limitations: [
      "Note IDs are capped at 64 characters; content at 4,000 characters",
      "No authentication; any client can read, write, or delete by ID",
      "KV is eventually consistent across edge locations",
    ],
  },
  "link-shortener": { limitations: [] },
  "page-metrics": {
    limitations: [
      "Requires Browser Rendering enabled on your Cloudflare account",
      "Local development needs `npx wrangler dev --remote`",
      "Metrics reflect one page load at a fixed 1280×800 viewport",
      "Navigation timeout may fail on heavy single-page applications",
    ],
  },
  "pdf-api": {
    limitations: [
      "Requires Browser Rendering enabled on your Cloudflare account",
      "Local development needs `npx wrangler dev --remote`",
      "Navigation timeout; complex or infinite-scroll pages may fail",
      "Fixed viewport; no PDF margin, format, or page-size options",
    ],
  },
  "r2-storage": {
    limitations: [
      "No authentication on API endpoints in this demo",
      "List operations return at most 1,000 keys per request",
      "Requires R2 bucket bindings and optional public URL configuration",
      "Not a multipart upload or large-file streaming demo",
    ],
  },
  "rendered-text": {
    limitations: [
      "Requires Browser Rendering enabled on your Cloudflare account",
      "Local development needs `npx wrangler dev --remote`",
      "Extracted text is truncated at a maximum length",
      "Navigation timeout on slow or script-heavy pages",
    ],
  },
  "response-headers": {
    limitations: [
      "Uses HEAD with GET fallback; some origins return different headers per method",
      "Single URL per request",
      "Fetch timeout on slow origins",
    ],
  },
  "screenshot-api": {
    useCases: [
      "Capture visual snapshots of web pages from the edge",
      "Generate thumbnails or previews for link-sharing tools",
      "Archive how a page looked at a point in time",
      "Learn Browser Rendering with Puppeteer on Workers",
    ],
    limitations: [
      "Requires Browser Rendering enabled on your Cloudflare account",
      "Fixed 1280×800 viewport; no custom dimensions in this experiment",
      "20-second navigation timeout; `networkidle0` may fail on busy sites",
      "Local development needs `npx wrangler dev --remote`",
    ],
  },
  "sentiment-analyzer": {
    limitations: [
      "Workers AI is subject to [usage limits](https://developers.cloudflare.com/workers-ai/platform/limits/) by plan",
      "Input text length is capped",
      "Accuracy varies on very short, sarcastic, or multilingual text",
    ],
  },
  "task-queue": {
    limitations: [
      "Demo queue with basic stats; no dead-letter queue or idempotency guarantees",
      "Message length is capped",
      "Requires Queue and KV bindings; not a stateless Worker",
    ],
  },
  "text-similarity": {
    limitations: [
      "Workers AI is subject to [usage limits](https://developers.cloudflare.com/workers-ai/platform/limits/) by plan",
      "Each input string length is capped",
      "Compares two strings only; no corpus or vector database search",
    ],
  },
  "text-translator": {
    limitations: [
      "Workers AI is subject to [usage limits](https://developers.cloudflare.com/workers-ai/platform/limits/) by plan",
      "Input text length is capped",
      "Single-string translation; no document or batch mode",
    ],
  },
  "turnstile-verify": {
    limitations: [
      "Requires a `TURNSTILE_SECRET_KEY` secret configured in the Worker",
      "Server-side verification only; does not render the Turnstile widget",
      "Turnstile tokens are single-use and expire quickly",
    ],
  },
  "url-dns-lookup": {
    useCases: [
      "Resolve DNS records for the hostname extracted from any URL",
      "Debug DNS configuration during deployments or migrations",
      "Build diagnostic tools without running `dig` locally",
      "Verify mail (MX), certificate (CAA), or CDN (CNAME) records from the edge",
    ],
    limitations: [
      "Uses the hostname only; URL path and query string are ignored",
      "Queries a fixed set of record types; no PTR or SRV in this experiment",
      "DoH timeout if upstream DNS is slow or unreachable",
      "Results reflect public DNS; may differ from resolver-specific or split-horizon views",
    ],
  },
  "vectorize-search": {
    limitations: [
      "Demo index; vectors are tied to your Vectorize binding and redeploy lifecycle",
      "Text length is capped before embedding",
      "Requires Workers AI and Vectorize bindings",
      "Semantic search over the demo corpus only; not a production RAG pipeline",
    ],
  },
  "website-devtools-inspector": {
    limitations: [
      "Static HTML fetch for most fields; not a live browser DevTools session",
      "HTML body is capped at 1MB before parsing",
      "Cannot inspect authenticated or paywalled pages",
      "No runtime network waterfall, console, or step-through debugging",
    ],
  },
  "website-metadata-extractor": {
    limitations: [
      "Static HTML only; tags set by client-side JavaScript may be missing",
      "Fetch timeout and HTML size limits on upstream pages",
      "Single URL per request; no batch extraction",
    ],
  },
  "website-to-api": {
    limitations: [
      "Static HTML parsing only; JavaScript-rendered content is not available",
      "Fetch timeout and HTML size limits apply",
      "Structure extraction is heuristic; not a full DOM or accessibility tree",
    ],
  },
  "website-to-llms-txt": {
    limitations: [
      "Static HTML extraction; client-rendered content is not executed",
      "Produces a simplified llms.txt for one URL, not a full site crawl",
      "Contact section only finds `mailto:` links present in the HTML",
    ],
  },
  "websocket-echo": {
    limitations: [
      "Echo server only; no persistence, rooms, or broadcast between clients",
      "No authentication or explicit message size limits in this demo",
      "WebSocket connections are subject to Worker CPU and duration limits",
    ],
  },
  whereami: {
    limitations: [
      "Returns Cloudflare `request.cf` metadata only; not a standalone geolocation API",
      "Local development returns minimal or empty `cf` data",
      "Available fields vary by request path and Cloudflare detection capabilities",
    ],
  },
};

function formatSection(title, items) {
  return `## ${title}\n\n${items.map((item) => `- ${item}`).join("\n")}\n`;
}

function hasSection(body, title) {
  return new RegExp(`^## ${title}$`, "m").test(body);
}

function appendAtEnd(body, block) {
  return `${body.trimEnd()}\n\n${block}\n`;
}

function insertAfterSection(body, sectionTitle, block) {
  const match = body.match(new RegExp(`^## ${sectionTitle}$`, "m"));
  if (!match || match.index === undefined) return appendAtEnd(body, block);

  const afterTitle = match.index + match[0].length;
  const rest = body.slice(afterTitle);
  const nextSection = rest.search(/\n## /);
  const insertAt = nextSection === -1 ? body.length : afterTitle + nextSection;
  const tail = body.slice(insertAt);

  return `${body.slice(0, insertAt).trimEnd()}\n\n${block}\n${tail.startsWith("\n") ? tail.slice(1) : tail}`;
}

function insertBeforeSection(body, sectionTitle, block) {
  const match = body.match(new RegExp(`^## ${sectionTitle}$`, "m"));
  if (!match || match.index === undefined) return appendAtEnd(body, block);
  return `${body.slice(0, match.index).trimEnd()}\n\n${block}\n\n${body.slice(match.index)}`;
}

function enhanceBody(slug, body) {
  const meta = CONTENT[slug];
  if (!meta) {
    console.warn(`No content metadata for ${slug}, skipping`);
    return body;
  }

  let next = body;

  if (meta.useCases?.length && !hasSection(next, "Use Cases")) {
    if (hasSection(next, "Deployment")) {
      next = insertBeforeSection(next, "Deployment", formatSection("Use Cases", meta.useCases));
    } else {
      next = appendAtEnd(next, formatSection("Use Cases", meta.useCases));
    }
  }

  if (meta.limitations.length && !hasSection(next, "Limitations")) {
    if (hasSection(next, "Use Cases")) {
      next = insertAfterSection(next, "Use Cases", formatSection("Limitations", meta.limitations));
    } else if (hasSection(next, "Deployment")) {
      next = insertBeforeSection(
        next,
        "Deployment",
        formatSection("Limitations", meta.limitations)
      );
    } else {
      next = appendAtEnd(next, formatSection("Limitations", meta.limitations));
    }
  }

  return next;
}

const files = readdirSync(DOCS_DIR).filter((file) => file.endsWith(".mdx"));
let updated = 0;

for (const file of files) {
  const slug = file.replace(/\.mdx$/, "");
  const path = join(DOCS_DIR, file);
  const original = readFileSync(path, "utf8");
  const enhanced = enhanceBody(slug, original);
  if (enhanced !== original) {
    writeFileSync(path, enhanced);
    updated += 1;
    console.log(`Updated ${file}`);
  }
}

console.log(`Done. Updated ${updated}/${files.length} experiment docs.`);
