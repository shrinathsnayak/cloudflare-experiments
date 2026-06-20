#!/usr/bin/env node
/** One-off: fill MDX for the 10 experiments added in batch. */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const DOCS = join(import.meta.dirname, "../content/docs/experiments");
const DEPLOY = (name) =>
  `https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/${name}`;

const experiments = [
  {
    name: "social-preview-inspector",
    title: "Social Preview Inspector",
    description:
      "Preview Twitter/X Cards, Open Graph unfurls, and Google snippets side by side with HTMLRewriter",
    intro:
      "Fetch any URL and extract `og:*`, `twitter:*`, `<title>`, and meta description tags with **HTMLRewriter**. Returns side-by-side preview validation for Twitter/X, Open Graph (Facebook/Slack), and Google search snippets, flagging missing required fields per platform.",
    features: [
      "GET /inspect — extract meta tags and validate per-platform preview requirements",
      "Side-by-side Twitter, Open Graph, and Google preview objects",
      "Flags missing and fallback fields (e.g. og:title used when twitter:title absent)",
    ],
    api: `### GET /inspect

Fetch a page and return social preview validation for three platforms.

**\`url\`** \`string\` (required)

Target URL (http or https only).

#### Example Request

\`\`\`bash
curl "https://your-worker.workers.dev/inspect?url=https://example.com"
\`\`\`

#### Success Response

\`\`\`json
{
  "url": "https://example.com/",
  "extracted": { "title": "Example", "description": "...", "openGraph": {}, "twitter": {} },
  "previews": {
    "openGraph": { "platform": "openGraph", "valid": true, "missing": [], "fields": {} },
    "twitter": { "platform": "twitter", "valid": false, "missing": ["image"], "fields": {} },
    "google": { "platform": "google", "valid": true, "missing": [], "fields": {} }
  }
}
\`\`\`

#### Error Codes

- \`400\` — \`INVALID_URL\`
- \`502\` — \`FETCH_ERROR\``,
    useCases: [
      "Debug why a link unfurls incorrectly on Slack, Twitter, or iMessage",
      "Audit marketing pages for missing Open Graph or Twitter Card tags",
      "Compare Google snippet fields against social preview metadata",
    ],
    limitations: [
      "Uses raw HTML fetch; does not execute JavaScript (client-rendered tags may be missing)",
      "Single URL per request; no batch inspection",
      "Platform validation rules are heuristic, not identical to each platform's renderer",
    ],
    config: null,
    cf: [
      "[Workers](https://developers.cloudflare.com/workers/)",
      "[HTMLRewriter](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/)",
    ],
  },
  {
    name: "dns-propagation-checker",
    title: "DNS Propagation Checker",
    description:
      "Compare DNS answers from Cloudflare, Google, and Quad9 resolvers in parallel via DoH",
    intro:
      "Query **DNS-over-HTTPS** resolvers (Cloudflare 1.1.1.1, Google 8.8.8.8, Quad9) in parallel for a domain and record type. Reports whether answers agree, each resolver's values, and response time.",
    features: [
      "GET /check — parallel DoH queries across three public resolvers",
      "Supports A, AAAA, CNAME, MX, TXT, NS record types",
      "Agreement summary plus per-resolver values and latency",
    ],
    api: `### GET /check

**\`domain\`** \`string\` (required) — Hostname to query (no scheme).

**\`type\`** \`string\` (required) — Record type: \`A\`, \`AAAA\`, \`CNAME\`, \`MX\`, \`TXT\`, or \`NS\`.

#### Example Request

\`\`\`bash
curl "https://your-worker.workers.dev/check?domain=example.com&type=A"
\`\`\`

#### Success Response

\`\`\`json
{
  "domain": "example.com",
  "type": "A",
  "agreement": true,
  "resolvers": [
    { "name": "Cloudflare", "values": ["93.184.216.34"], "responseTimeMs": 42, "error": null }
  ]
}
\`\`\`

#### Error Codes

- \`400\` — \`INVALID_DOMAIN\`, \`INVALID_TYPE\`
- \`502\` — \`DNS_ERROR\``,
    useCases: [
      "Verify DNS changes have propagated globally after a cutover",
      "Compare resolver behavior during TTL or nameserver migrations",
      "Debug split-horizon or stale cache issues across providers",
    ],
    limitations: [
      "Queries three public DoH endpoints only; not exhaustive global propagation",
      "Single record type per request",
      "Resolver errors return partial results rather than failing the whole request",
    ],
    config: null,
    cf: [
      "[Workers](https://developers.cloudflare.com/workers/)",
      "[DNS over HTTPS](https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/)",
    ],
  },
  {
    name: "webhook-signature-verifier",
    title: "Webhook Signature Verifier",
    description: "Verify HMAC-SHA256 webhook signatures with timing-safe comparison at the edge",
    intro:
      "Accept a raw payload, secret, signature header value, and algorithm. Computes the expected HMAC (Stripe/GitHub \`sha256=\` hex style) and returns whether it matches using a **timing-safe compare**.",
    features: [
      "POST /verify — HMAC-SHA256 verification with clear comparison explanation",
      "Supports prefixed signatures (\`sha256=...\`) and raw hex",
      "Uses Web Crypto at the edge; no external libraries",
    ],
    api: `### POST /verify

**\`payload\`** \`string\` (required) — Raw request body as received.

**\`secret\`** \`string\` (required) — Shared signing secret.

**\`signature\`** \`string\` (required) — Signature from the webhook header.

**\`algorithm\`** \`string\` (optional) — Default \`sha256\`.

#### Example Request

\`\`\`bash
curl -X POST "https://your-worker.workers.dev/verify" \\
  -H "Content-Type: application/json" \\
  -d '{"payload":"{\\"id\\":1}","secret":"whsec_test","signature":"sha256=..."}'
\`\`\`

#### Success Response

\`\`\`json
{
  "match": true,
  "algorithm": "sha256",
  "expectedSignature": "sha256=...",
  "providedSignature": "sha256=...",
  "explanation": "Timing-safe comparison of 32-byte HMAC digests returned match."
}
\`\`\`

#### Error Codes

- \`400\` — \`INVALID_BODY\`, \`MISSING_FIELD\`, \`INVALID_ALGORITHM\``,
    useCases: [
      "Debug Stripe, GitHub, or Shopify webhook signature mismatches",
      "Learn timing-safe HMAC verification patterns for Workers",
      "Validate signing logic before wiring production webhook handlers",
    ],
    limitations: [
      "HMAC-SHA256 only in this experiment",
      "Secrets are sent in the request body; use only for debugging, not production traffic",
      "No replay protection or timestamp validation",
    ],
    config: null,
    cf: [
      "[Workers](https://developers.cloudflare.com/workers/)",
      "[Web Crypto](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/)",
    ],
  },
  {
    name: "cors-preflight-tester",
    title: "CORS Preflight Tester",
    description: "Simulate browser CORS preflight OPTIONS requests and analyze response headers",
    intro:
      "Send an **OPTIONS** preflight to a target URL with a simulated origin, method, and requested headers. Reports which CORS response headers are present, missing, or misconfigured relative to what the browser would require.",
    features: [
      "POST /test — simulate Access-Control-Request-Method/Headers preflight",
      "Analyzes Allow-Origin, Allow-Methods, Allow-Headers, Allow-Credentials",
      "Returns actionable pass/fail per header requirement",
    ],
    api: `### POST /test

**\`url\`** \`string\` (required) — Target URL (http or https).

**\`origin\`** \`string\` (required) — Simulated Origin header value.

**\`method\`** \`string\` (required) — Intended request method (e.g. \`POST\`).

**\`headers\`** \`string[]\` (optional) — Request headers for preflight (e.g. \`["Content-Type"]\`).

#### Example Request

\`\`\`bash
curl -X POST "https://your-worker.workers.dev/test" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://api.example.com/data","origin":"https://app.example.com","method":"POST","headers":["Content-Type"]}'
\`\`\`

#### Error Codes

- \`400\` — \`INVALID_BODY\`, \`INVALID_URL\`, \`INVALID_ORIGIN\`, \`INVALID_METHOD\`
- \`502\` — \`PREFLIGHT_ERROR\``,
    useCases: [
      "Debug why a browser blocks cross-origin API calls",
      "Validate CORS headers before deploying a new frontend origin",
      "Compare preflight behavior across staging and production APIs",
    ],
    limitations: [
      "Simulates preflight from Workers egress, not from an end-user browser network",
      "Does not follow complex redirect chains for OPTIONS",
      "Single preflight scenario per request",
    ],
    config: null,
    cf: [
      "[Workers](https://developers.cloudflare.com/workers/)",
      "[Fetch API](https://developers.cloudflare.com/workers/runtime-apis/fetch/)",
    ],
  },
  {
    name: "api-mock-server",
    title: "API Mock Server",
    description: "Define mock HTTP endpoints stored in Workers KV and serve them on demand",
    intro:
      "Create configurable mock API responses (path, method, status, JSON body, optional delay) stored in **Workers KV**. Any matching request to `/mock/:slug` returns the configured response.",
    features: [
      "POST /configs — create a mock and receive a slug",
      "GET /configs — list all mocks",
      "GET /mock/:slug — serve the configured response",
      "DELETE /configs/:slug — remove a mock",
    ],
    api: `### POST /configs

Create a mock endpoint configuration.

**\`path\`** \`string\` (required) — Mock path (must start with \`/\`).

**\`method\`** \`string\` (required) — HTTP method.

**\`status\`** \`number\` (required) — Response status (100–599).

**\`body\`** \`object\` (required) — JSON response body.

**\`delayMs\`** \`number\` (optional) — Artificial delay (0–30000 ms).

### GET /mock/:slug

Serve the mock when the request method matches the stored config.

### DELETE /configs/:slug

Delete a mock by slug.

#### Error Codes

- \`400\` — \`INVALID_BODY\`, validation errors
- \`404\` — \`NOT_FOUND\``,
    useCases: [
      "Stub third-party APIs during frontend development",
      "Demo API integrations without standing up a full backend",
      "Test client retry and timeout behavior with configurable delays",
    ],
    limitations: [
      "Requires a KV namespace binding",
      "No authentication on config endpoints",
      "Mocks are global to the namespace; not multi-tenant",
    ],
    config: "Create a KV namespace and set its id in `wrangler.json` under `MOCKS`.",
    cf: [
      "[Workers](https://developers.cloudflare.com/workers/)",
      "[Workers KV](https://developers.cloudflare.com/kv/)",
    ],
  },
  {
    name: "ai-gateway-dashboard",
    title: "AI Gateway Dashboard",
    description: "Route Workers AI through AI Gateway and surface cache and latency metadata",
    intro:
      "Call **Workers AI** through **AI Gateway** instead of direct inference. Returns generated text plus gateway metadata (cache status, latency). Optionally compare cached vs fresh requests for the same prompt.",
    features: [
      "POST /generate — text generation via AI Gateway",
      "Returns latency and cache hit/miss metadata",
      "Optional compareCache mode runs cached vs skipCache requests",
    ],
    api: `### POST /generate

**\`prompt\`** \`string\` (required) — Text prompt for the model.

**\`compareCache\`** \`boolean\` (optional) — Run cached and fresh requests and compare latency.

Default model: \`@cf/meta/llama-3.1-8b-instruct-fast\`.

#### Example Request

\`\`\`bash
curl -X POST "https://your-worker.workers.dev/generate" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"Explain Workers AI in one sentence","compareCache":true}'
\`\`\`

#### Error Codes

- \`400\` — \`INVALID_BODY\`, \`MISSING_PROMPT\`
- \`502\` — \`AI_ERROR\``,
    useCases: [
      "Learn AI Gateway cache behavior vs direct Workers AI calls",
      "Compare latency for repeated prompts in prototyping",
      "Reference pattern for gateway options in production Workers",
    ],
    limitations: [
      "Requires Workers AI and AI Gateway enabled on your account",
      "Cache metadata depends on gateway configuration",
      "Text generation only; fixed default model",
    ],
    config:
      "AI binding in `wrangler.json`. Use gateway id `default` or your own gateway ID in code.",
    cf: [
      "[Workers AI](https://developers.cloudflare.com/workers-ai/)",
      "[AI Gateway](https://developers.cloudflare.com/ai-gateway/)",
    ],
  },
  {
    name: "readability-extractor",
    title: "Readability Extractor",
    description:
      "Extract clean article content from URLs using Browser Rendering and readability heuristics",
    intro:
      "Load a fully rendered page with **Browser Rendering**, then strip navigation, ads, and sidebars using readability-style heuristics. Returns title, author (when detectable), body text, word count, and estimated read time.",
    features: [
      "GET /extract — rendered DOM extraction with readability heuristics",
      "Returns title, author, body, wordCount, readTimeMinutes",
      "Uses @cloudflare/puppeteer like other Browser Rendering experiments",
    ],
    api: `### GET /extract

**\`url\`** \`string\` (required) — Article URL (http or https).

#### Example Request

\`\`\`bash
curl "https://your-worker.workers.dev/extract?url=https://example.com/article"
\`\`\`

#### Error Codes

- \`400\` — \`INVALID_URL\`
- \`502\` — \`EXTRACT_ERROR\``,
    useCases: [
      "Build reading-mode or newsletter digest pipelines",
      "Extract main content from JavaScript-heavy news sites",
      "Prototype RAG document ingestion from article URLs",
    ],
    limitations: [
      "Requires Browser Rendering on your account",
      "Heuristic extraction; not identical to Mozilla Readability",
      "Local dev may need `wrangler dev --remote` for browser binding",
    ],
    config: "Browser binding `BROWSER` and `nodejs_compat_v2` in `wrangler.json`.",
    cf: [
      "[Browser Rendering](https://developers.cloudflare.com/browser-rendering/)",
      "[Workers](https://developers.cloudflare.com/workers/)",
    ],
  },
  {
    name: "webhook-relay-inspector",
    title: "Webhook Relay Inspector",
    description:
      "Capture inbound HTTP webhooks in a Durable Object session for debugging and replay",
    intro:
      "Create a unique inbound URL per session with a **Durable Object**. Any HTTP request to that URL is captured (method, headers, body, timestamp) and can be listed or inspected for webhook debugging.",
    features: [
      "POST /relay/new — create a capture session",
      "ALL /relay/:id — capture inbound requests",
      "GET /relay/:id/requests — list captures",
      "GET /relay/:id/requests/:requestId — full request details",
    ],
    api: `### POST /relay/new

Create a new relay session.

#### Success Response

\`\`\`json
{ "id": "abc123", "inboundUrl": "https://your-worker.workers.dev/relay/abc123" }
\`\`\`

### ALL /relay/:id

Captures any inbound HTTP request to the session.

### GET /relay/:id/requests

List captured requests (summary).

### GET /relay/:id/requests/:requestId

Full request details including headers and body.

#### Error Codes

- \`404\` — \`NOT_FOUND\`
- \`400\` — \`INVALID_ID\``,
    useCases: [
      "Debug Stripe, GitHub, or custom webhook payloads during integration",
      "Share a temporary inbound URL with a third party for testing",
      "Inspect headers and raw body without deploying a full receiver",
    ],
    limitations: [
      "Requires Durable Objects binding and migration",
      "Sessions are not authenticated; anyone with the URL can post",
      "Storage is bounded by DO limits; not long-term log retention",
    ],
    config: "Durable Object `RELAY` / `WebhookRelay` with migration in `wrangler.json`.",
    cf: [
      "[Durable Objects](https://developers.cloudflare.com/durable-objects/)",
      "[Workers](https://developers.cloudflare.com/workers/)",
    ],
  },
  {
    name: "website-change-tracker",
    title: "Website Change Tracker",
    description: "Scheduled Browser Rendering snapshots with R2 storage and D1 diff history",
    intro:
      "Register URLs for on-demand and **Cron**-scheduled snapshots. Rendered text is stored in **R2**, content hashes and diff summaries in **D1**. View change history per tracked URL.",
    features: [
      "POST /track — register a URL",
      "DELETE /track?url= — unregister",
      "GET /history?url= — snapshot diff history",
      "Scheduled handler every 30 minutes for tracked URLs",
    ],
    api: `### POST /track

Register a URL for scheduled tracking.

\`\`\`json
{ "url": "https://example.com" }
\`\`\`

### DELETE /track?url=

Unregister a tracked URL.

### GET /history?url=

Return snapshot history with content hashes and diff summaries.

#### Error Codes

- \`400\` — \`INVALID_URL\`, \`INVALID_BODY\`
- \`404\` — \`NOT_TRACKED\``,
    useCases: [
      "Monitor marketing or legal pages for unexpected content changes",
      "Learn R2 + D1 + Cron + Browser Rendering together",
      "Prototype change-detection alerts before production hardening",
    ],
    limitations: [
      "Requires D1, R2, Browser Rendering, and Cron bindings",
      "Diff summary is line-based heuristic, not semantic",
      "30-minute cron interval; not real-time",
    ],
    config:
      "D1 `DB`, R2 `SNAPSHOTS`, Browser `BROWSER`, cron `*/30 * * * *`. Run D1 migrations before deploy.",
    cf: [
      "[Browser Rendering](https://developers.cloudflare.com/browser-rendering/)",
      "[R2](https://developers.cloudflare.com/r2/)",
      "[D1](https://developers.cloudflare.com/d1/)",
      "[Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)",
    ],
  },
  {
    name: "uptime-monitor-alerts",
    title: "Uptime Monitor Alerts",
    description:
      "Persistent URL monitors with D1 history, cron checks, and email alerts on downtime",
    intro:
      "Extend the is-it-down pattern into a persistent monitor. **Cron** pings registered URLs, logs checks to **D1**, and sends **email alerts** when a URL transitions from up to down.",
    features: [
      "POST /monitors — register URL + alert email",
      "DELETE /monitors/:id — remove monitor",
      "GET /monitors/:id/history — check history and uptime percentage",
      "Scheduled checks every 5 minutes",
    ],
    api: `### POST /monitors

\`\`\`json
{ "url": "https://example.com", "alertEmail": "you@example.com" }
\`\`\`

### DELETE /monitors/:id

Remove a monitor.

### GET /monitors/:id/history

Returns check history and uptime percentage.

#### Error Codes

- \`400\` — \`INVALID_URL\`, \`INVALID_EMAIL\`, \`INVALID_BODY\`
- \`404\` — \`NOT_FOUND\``,
    useCases: [
      "Lightweight uptime monitoring for side projects",
      "Learn Cron + D1 + send_email alert patterns on Workers",
      "Track uptime percentage over time for SLA reporting",
    ],
    limitations: [
      "Requires D1, Cron, and send_email bindings configured for your domain",
      "5-minute check interval; not sub-minute alerting",
      "Single-region edge checks; not global multi-PoP consensus",
    ],
    config:
      "D1 `DB`, `send_email` binding `EMAILER`, cron `*/5 * * * *`. Configure allowed sender/destination addresses in wrangler.",
    cf: [
      "[D1](https://developers.cloudflare.com/d1/)",
      "[Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)",
      "[Email Routing / send_email](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/)",
    ],
  },
];

function render(exp) {
  const deployNote =
    exp.config ??
    (exp.cf.length > 1
      ? "See `wrangler.json` and the experiment README for required bindings."
      : "No additional configuration required.");

  return `---
title: "${exp.title}"
description: "${exp.description}"
---

${exp.intro}

## Features

${exp.features.map((f) => `- ${f}`).join("\n")}

## API Reference

${exp.api}

## Use Cases

${exp.useCases.map((u) => `- ${u}`).join("\n")}

## Limitations

${exp.limitations.map((l) => `- ${l}`).join("\n")}

## Deployment

<Steps>
  <Step>

### Click the deploy button

    [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](${DEPLOY(exp.name)})

  </Step>
  <Step>

### Configure bindings

    ${deployNote}

  </Step>
  <Step>

### Test your deployment

    See the experiment README for curl examples.

  </Step>
</Steps>

## Local Development

\`\`\`bash
cd apps/experiments/${exp.name}
npm install
npm run dev
\`\`\`

## Configuration

${exp.config ? exp.config : "No bindings required beyond the Workers runtime."}

## Cloudflare Features Used

${exp.cf.map((c) => `- **${c}**`).join("\n")}
`;
}

for (const exp of experiments) {
  writeFileSync(join(DOCS, `${exp.name}.mdx`), render(exp), "utf8");
  console.log("Wrote", exp.name);
}
