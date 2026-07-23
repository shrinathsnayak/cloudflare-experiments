# Cloudflare Experiments

A curated collection of **reference implementations** for building with **Cloudflare products and services**.

📖 **Documentation:** [cloudflare-experiments.com](https://cloudflare-experiments.com) · source in [`apps/docs/`](apps/docs/) (Fumadocs + Next.js)

The goal of this repository is to help developers **learn how to use Cloudflare platform features** by studying small, deployable examples. Each experiment maps to a specific product or capability — Workers AI, Durable Objects, Queues, D1, R2, Hyperdrive, Email Workers, Browser Rendering, and more.

Each experiment is:

- **Product-focused** - demonstrates one Cloudflare capability
- **Independently deployable** - clone or deploy a single example
- **Easy to understand** - minimal code, consistent structure
- **Designed to run in under 60 seconds**
- **Click-to-Deploy ready**

---

## Philosophy

Most Cloudflare tutorials show very simple examples (Hello World, basic KV counters, simple fetch). This repository focuses instead on **reference implementations you can copy when building with Cloudflare products**.

Every experiment demonstrates **one specific Cloudflare capability**, including:

- Cloudflare Workers
- Workers AI + AI Gateway
- Browser Rendering
- Durable Objects + Alarms
- Queues + Workflows
- Cron Triggers
- D1, KV, R2, Vectorize
- Hyperdrive (Postgres)
- Email Workers / Email Routing
- HTMLRewriter
- Edge networking + Cache API
- Web Crypto, WebSockets
- Turnstile, Rate Limiting, Analytics Engine

---

## Repository Structure

```
cloudflare-experiments/
├── apps/
│   ├── docs/                 # Fumadocs documentation site (cloudflare-experiments.com)
│   └── experiments/          # 69 independently deployable Worker experiments
├── turbo.json
├── .cursor/                  # Agent rules and skills
├── README.md
└── LICENSE
```

This is a **Turborepo** monorepo. Each experiment lives under [`apps/experiments/<name>/`](apps/experiments/) with its own `package.json`, `wrangler.json`, Vitest tests, and Deploy button. Full API docs for every experiment are in [`apps/docs/`](apps/docs/).

---

## Experiments

There are **69** experiments, grouped the same way as the [docs sidebar](https://cloudflare-experiments.com/docs). Each row links to the source and a one-click Cloudflare deploy.

### AI & Machine Learning

| Experiment                                                                 | Description                                                                               | Deploy                                                                                                                                                              |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [AI Website Summary](apps/experiments/ai-website-summary/)                 | Summarize any webpage using Workers AI                                                    | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ai-website-summary)         |
| [AI Website Tag Generator](apps/experiments/ai-website-tag-generator/)     | Generate topic tags for any website using Workers AI                                      | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ai-website-tag-generator)   |
| [GitHub Repo Explainer](apps/experiments/github-repo-explainer/)           | AI explanation of any GitHub repository from README and key files                         | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/github-repo-explainer)      |
| [AI Bot Visibility](apps/experiments/ai-bot-visibility/)                   | Check if a URL is configured to be visible or blocked for AI crawlers (robots.txt + meta) | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ai-bot-visibility)          |
| [Cloud AI Proxy](apps/experiments/cloud-ai-proxy/)                         | Call Workers AI with any model and prompt from a single public endpoint                   | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/cloud-ai-proxy)             |
| [Text Translator](apps/experiments/text-translator/)                       | Translate text between languages using Workers AI                                         | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/text-translator)            |
| [Sentiment Analyzer](apps/experiments/sentiment-analyzer/)                 | Analyze text sentiment (positive/negative) with Workers AI                                | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/sentiment-analyzer)         |
| [Text Similarity](apps/experiments/text-similarity/)                       | Compare semantic similarity of two texts using Workers AI embeddings                      | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/text-similarity)            |
| [AI Image Generator](apps/experiments/ai-image-generator/)                 | Generate images from text prompts using Workers AI (FLUX)                                 | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ai-image-generator)         |
| [Speech to Text Transcriber](apps/experiments/speech-to-text-transcriber/) | Transcribe uploaded audio with Workers AI Whisper                                         | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/speech-to-text-transcriber) |
| [RAG Mini Search](apps/experiments/rag-mini-search/)                       | Grounded Q&A with Vectorize retrieval and Workers AI                                      | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/rag-mini-search)            |
| [AI Gateway Dashboard](apps/experiments/ai-gateway-dashboard/)             | Workers AI through AI Gateway with cache and latency metadata                             | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ai-gateway-dashboard)       |

### Web Scraping & Parsing

| Experiment                                                                 | Description                                                                       | Deploy                                                                                                                                                              |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Website Metadata Extractor](apps/experiments/website-metadata-extractor/) | Extract title, description, Open Graph, canonical from any page                   | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/website-metadata-extractor) |
| [Website to API](apps/experiments/website-to-api/)                         | Turn any webpage into structured JSON (title, headings, links, images)            | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/website-to-api)             |
| [Website to llms.txt](apps/experiments/website-to-llms-txt/)               | Convert any webpage into llms.txt format for LLM consumption                      | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/website-to-llms-txt)        |
| [Website DevTools Inspector](apps/experiments/website-devtools-inspector/) | DevTools-style inspection: headers, cookies, scripts, assets                      | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/website-devtools-inspector) |
| [Dependency Analyzer](apps/experiments/dependency-analyzer/)               | Analyze all external resources (scripts, styles, fonts, images)                   | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/dependency-analyzer)        |
| [HTML Rewriter](apps/experiments/html-rewriter/)                           | Extract HTML stats and transform pages with HTMLRewriter at the edge              | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/html-rewriter)              |
| [Social Preview Inspector](apps/experiments/social-preview-inspector/)     | Preview Twitter/X, Open Graph, and Google snippets side by side with HTMLRewriter | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/social-preview-inspector)   |
| [Readability Extractor](apps/experiments/readability-extractor/)           | Extract clean article content with Browser Rendering and readability heuristics   | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/readability-extractor)      |
| [Robots Sitemap Inspector](apps/experiments/robots-sitemap-inspector/)     | Parse robots.txt and linked sitemaps for SEO debugging                            | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/robots-sitemap-inspector)   |
| [RSS / Atom Feed Parser](apps/experiments/rss-atom-feed-parser/)           | Parse RSS or Atom feeds into normalized JSON from the edge                        | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/rss-atom-feed-parser)       |
| [JSON-LD Extractor](apps/experiments/json-ld-extractor/)                   | Extract Schema.org JSON-LD structured data from any webpage                       | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/json-ld-extractor)          |
| [HTML to Markdown](apps/experiments/html-to-markdown/)                     | Convert any webpage HTML into clean Markdown from the edge                        | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/html-to-markdown)           |

### Browser Rendering

| Experiment                                         | Description                                                            | Deploy                                                                                                                                                  |
| -------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Screenshot API](apps/experiments/screenshot-api/) | Capture screenshots of any website from the edge (Browser Rendering)   | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/screenshot-api) |
| [PDF API](apps/experiments/pdf-api/)               | Generate PDF documents from any webpage using Browser Rendering        | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/pdf-api)        |
| [Page Metrics](apps/experiments/page-metrics/)     | Collect Puppeteer page load metrics (DOM nodes, script duration, heap) | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/page-metrics)   |
| [Rendered Text](apps/experiments/rendered-text/)   | Extract JavaScript-rendered visible text from any webpage              | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/rendered-text)  |
| [Browser Links](apps/experiments/browser-links/)   | Extract unique links from JavaScript-rendered pages                    | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/browser-links)  |

### Network & Monitoring

| Experiment                                                               | Description                                                                  | Deploy                                                                                                                                                             |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Is It Down](apps/experiments/is-it-down/)                               | Check if a website is reachable from Cloudflare's edge                       | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/is-it-down)                |
| [URL DNS Lookup](apps/experiments/url-dns-lookup/)                       | Get all DNS records (A, AAAA, MX, NS, TXT, etc.) for any URL's hostname      | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/url-dns-lookup)            |
| [Email Auth Checker](apps/experiments/email-auth-checker/)               | Analyze SPF, DMARC, and DKIM for a domain via Cloudflare DoH                 | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/email-auth-checker)        |
| [Edge Redirect Simulator](apps/experiments/edge-redirect-simulator/)     | Show redirect chains for any URL (each hop and status code)                  | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/edge-redirect-simulator)   |
| [Where Am I](apps/experiments/whereami/)                                 | Request metadata from Cloudflare's edge (request.cf geolocation, colo)       | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/whereami)                  |
| [Response Headers](apps/experiments/response-headers/)                   | Inspect HTTP response headers for any URL from the edge                      | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/response-headers)          |
| [Security Headers Grader](apps/experiments/security-headers-grader/)     | Grade HSTS/CSP/XFO and related security headers with fix guidance            | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/security-headers-grader)   |
| [SSL Certificate Inspector](apps/experiments/ssl-certificate-inspector/) | Inspect TLS certificate metadata for a domain                                | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ssl-certificate-inspector) |
| [Multi-PoP Latency Map](apps/experiments/multi-pop-latency-map/)         | Fetch latency plus serving colo (single PoP per request)                     | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/multi-pop-latency-map)     |
| [DNS Propagation Checker](apps/experiments/dns-propagation-checker/)     | Compare DNS answers from Cloudflare, Google, and Quad9 resolvers in parallel | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/dns-propagation-checker)   |
| [Website Change Tracker](apps/experiments/website-change-tracker/)       | Scheduled snapshots with R2 storage and D1 diff history                      | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/website-change-tracker)    |
| [Uptime Monitor Alerts](apps/experiments/uptime-monitor-alerts/)         | Persistent URL monitors with D1 history and email alerts on downtime         | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/uptime-monitor-alerts)     |
| [CORS Preflight Tester](apps/experiments/cors-preflight-tester/)         | Simulate browser CORS preflight OPTIONS and analyze response headers         | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/cors-preflight-tester)     |
| [Broken Link Checker](apps/experiments/broken-link-checker/)             | Extract page links and report HTTP status codes from the edge                | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/broken-link-checker)       |

### Edge Platform

| Experiment                                                                 | Description                                                         | Deploy                                                                                                                                                              |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Edge Cache](apps/experiments/edge-cache/)                                 | Fetch URLs with the Workers Cache API; report HIT/MISS/BYPASS       | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/edge-cache)                 |
| [Crypto Hash](apps/experiments/crypto-hash/)                               | Compute SHA-256/384/512 digests with the Web Crypto API at the edge | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/crypto-hash)                |
| [WebSocket Echo](apps/experiments/websocket-echo/)                         | WebSocket echo server using WebSocketPair on Workers                | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/websocket-echo)             |
| [Image Resizer](apps/experiments/image-resizer/)                           | Resize remote images with Cloudflare Image Resizing via `cf.image`  | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/image-resizer)              |
| [Turnstile Verify](apps/experiments/turnstile-verify/)                     | Verify Cloudflare Turnstile tokens via the siteverify API           | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/turnstile-verify)           |
| [JWT Inspector](apps/experiments/jwt-inspector/)                           | Decode, verify, and issue JWTs for experimentation                  | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/jwt-inspector)              |
| [Rate Limiter Demo](apps/experiments/rate-limiter-demo/)                   | Native Workers Rate Limiting binding with 429 responses             | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/rate-limiter-demo)          |
| [Webhook Signature Verifier](apps/experiments/webhook-signature-verifier/) | Verify HMAC-SHA256 webhook signatures with timing-safe compare      | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/webhook-signature-verifier) |

### Storage & Data

| Experiment                                                   | Description                                                           | Deploy                                                                                                                                                       |
| ------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [R2 Storage](apps/experiments/r2-storage/)                   | R2 storage API with list/get/put/delete and configurable list options | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/r2-storage)          |
| [Link Shortener](apps/experiments/link-shortener/)           | Shorten URLs and redirect with D1 (POST /shorten, GET /:code)         | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/link-shortener)      |
| [D1 SQL Playground](apps/experiments/d1-sql-playground/)     | Read-only SQL playground over a seeded D1 database (POST /query)      | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/d1-sql-playground)   |
| [KV Notes](apps/experiments/kv-notes/)                       | Simple note storage with Workers KV (POST/GET/DELETE /notes)          | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/kv-notes)            |
| [Vectorize Search](apps/experiments/vectorize-search/)       | Semantic search with Workers AI embeddings and Vectorize              | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/vectorize-search)    |
| [Presigned R2 Upload](apps/experiments/presigned-r2-upload/) | Presigned PUT URLs for direct browser-to-R2 uploads                   | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/presigned-r2-upload) |
| [API Mock Server](apps/experiments/api-mock-server/)         | Define mock HTTP endpoints in KV and serve them on demand             | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/api-mock-server)     |
| [Hyperdrive SQL Demo](apps/experiments/hyperdrive-sql-demo/) | Query PostgreSQL through Cloudflare Hyperdrive connection pooling     | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/hyperdrive-sql-demo) |

### Stateful & Async

| Experiment                                                           | Description                                                           | Deploy                                                                                                                                                           |
| -------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Durable Counter](apps/experiments/durable-counter/)                 | Globally consistent counter using Durable Objects (reference pattern) | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/durable-counter)         |
| [Cron Heartbeat](apps/experiments/cron-heartbeat/)                   | Scheduled tasks with Cron Triggers; persists run metadata in KV       | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/cron-heartbeat)          |
| [Task Queue](apps/experiments/task-queue/)                           | Enqueue background tasks with Queues; async consumer with KV stats    | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/task-queue)              |
| [Analytics Engine](apps/experiments/analytics-engine/)               | Write custom analytics events with Workers Analytics Engine           | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/analytics-engine)        |
| [Workflows Pipeline Demo](apps/experiments/workflows-pipeline-demo/) | Durable fetch → AI summarize → R2 pipeline with Cloudflare Workflows  | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/workflows-pipeline-demo) |
| [Live Cursor Tracker](apps/experiments/live-cursor-tracker/)         | Real-time shared cursors over WebSocket via Durable Objects           | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/live-cursor-tracker)     |
| [Queue Job Visualizer](apps/experiments/queue-job-visualizer/)       | Queues producer/consumer with KV job status and simulated retries     | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/queue-job-visualizer)    |
| [DO Alarm Scheduler](apps/experiments/do-alarm-scheduler/)           | One-off reminders with the Durable Object Alarm API                   | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/do-alarm-scheduler)      |
| [Webhook Relay Inspector](apps/experiments/webhook-relay-inspector/) | Capture inbound webhooks in a Durable Object session for debugging    | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/webhook-relay-inspector) |
| [Email Worker Inbox](apps/experiments/email-worker-inbox/)           | Receive inbound emails with Email Workers and inspect them via KV     | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/email-worker-inbox)      |

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:

- How to submit **bug reports** and **pull requests**
- **Code and structure standards** (experiment layout, TypeScript, errors, validation)
- How to **propose or add a new experiment**
- **Testing**: Run `npm run test` from the repo root (Turborepo), or `npm run test` inside a single app.
- **Formatting**: From the repo root, run `npm run format` (Prettier) and `npm run lint` (ESLint). New apps must include test setup and follow the shared Prettier config.
- **Build all apps**: `npm run build` from the repo root.

By participating, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Key Features

- **Independent deployments**: Every experiment includes a Cloudflare Deploy Button; deploy a single experiment without touching the others.
- **Product reference**: Each experiment teaches how to wire up a specific Cloudflare product or binding.
- **Single responsibility**: One experiment, one Cloudflare capability.
- **Docs site**: Full API docs at [cloudflare-experiments.com](https://cloudflare-experiments.com), including **New** badges for recently added experiments.

---

## Future Experiments

Additional platform features that may be explored:

- D1 full-text search
- Cloudflare Stream
- Workers Containers / Sandbox
- Secrets Store rotation patterns

---

## License

MIT - see [LICENSE](LICENSE).
