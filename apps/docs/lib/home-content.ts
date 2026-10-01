import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  Boxes,
  Camera,
  Code,
  FileCode,
  HardDrive,
  Layers,
  PlusCircle,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export type HomeExperiment = {
  slug: string;
  title: string;
  description: string;
  /** Optional homepage/sidebar status badge, e.g. "new". */
  status?: string;
};

export type HomeCategory = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Icon chip classes; full literals so Tailwind can detect them. */
  accent: string;
  experiments: HomeExperiment[];
};

/** Homepage shows at most this many "New" badges so the label keeps meaning. */
export const maxFeaturedNewBadges = 2;

export const homePrinciples = [
  {
    title: "Edge-first",
    description:
      "Every experiment runs on Cloudflare Workers at the edge - low latency, global reach, no servers to manage.",
  },
  {
    title: "Single responsibility",
    description:
      "One experiment, one capability. Copy a focused reference instead of untangling a monolith.",
  },
  {
    title: "Independently deployable",
    description:
      "Each folder is self-contained with its own wrangler.json, tests, and one-click Deploy button.",
  },
  {
    title: "Under 60 seconds",
    description:
      "Request paths are designed to complete quickly - ideal for learning, demos, and prototyping.",
  },
] as const;

export const homeWorkflow = [
  {
    step: "01",
    title: "Pick an experiment",
    description:
      "Browse by category - AI, scraping, compute, storage - or search docs by binding name like d1 or r2.",
  },
  {
    step: "02",
    title: "Run locally",
    description:
      "Clone the monorepo, npm install, and npm run dev -- --filter=<name>. Wrangler serves on port 8787.",
  },
  {
    step: "03",
    title: "Deploy to Workers",
    description:
      "Use the Deploy button in each README or wrangler deploy. Configure bindings in the Cloudflare dashboard.",
  },
  {
    step: "04",
    title: "Adapt the pattern",
    description:
      "Fork the code into your project. Each experiment is MIT licensed - use it as a starting point, not a dependency.",
  },
] as const;

/** Crowd-pleasers first: useful on day one, easy to demo, cover the headline products. */
export const featuredExperiments: HomeExperiment[] = [
  {
    slug: "screenshot-api",
    title: "Screenshot API",
    description: "PNG screenshot of any URL from headless Chrome at the edge",
  },
  {
    slug: "ai-website-summary",
    title: "AI Website Summary",
    description: "Summarize any webpage with a Workers AI model",
  },
  {
    slug: "is-it-down",
    title: "Is It Down",
    description: "Check whether a site is reachable from Cloudflare's network",
  },
  {
    slug: "whereami",
    title: "Where Am I",
    description: "Geolocation, colo, ASN, and timezone from request.cf",
  },
  {
    slug: "link-shortener",
    title: "Link Shortener",
    description: "Short links with D1 as the source of truth and KV as a cache",
  },
  {
    slug: "rag-mini-search",
    title: "RAG Mini Search",
    description: "Grounded Q&A with Vectorize retrieval and Workers AI",
  },
  {
    slug: "mcp-tools-server",
    title: "MCP Tools Server",
    description: "Remote MCP server with DNS, headers, and uptime tools for AI clients",
    status: "new",
  },
  {
    slug: "one-time-secret",
    title: "One-Time Secret",
    description: "Self-destructing secret links with AES-GCM and Durable Objects",
    status: "new",
  },
];

export const homeCategories: HomeCategory[] = [
  {
    id: "ai",
    title: "AI & Machine Learning",
    description: "Workers AI, embeddings, RAG, image generation, and AI Gateway patterns.",
    icon: Sparkles,
    accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    experiments: [
      {
        slug: "ai-website-summary",
        title: "AI Website Summary",
        description: "Summarize webpages with Workers AI",
      },
      {
        slug: "ai-website-tag-generator",
        title: "AI Website Tag Generator",
        description: "Generate topic tags for any site",
      },
      {
        slug: "github-repo-explainer",
        title: "GitHub Repo Explainer",
        description: "AI explanation of GitHub repos",
      },
      {
        slug: "ai-bot-visibility",
        title: "AI Bot Visibility",
        description: "Check AI crawler access in robots.txt",
      },
      {
        slug: "cloud-ai-proxy",
        title: "Cloud AI Proxy",
        description: "Call any Workers AI model from one endpoint",
      },
      {
        slug: "text-translator",
        title: "Text Translator",
        description: "Translate text at the edge",
      },
      {
        slug: "sentiment-analyzer",
        title: "Sentiment Analyzer",
        description: "Positive/negative sentiment analysis",
      },
      {
        slug: "text-similarity",
        title: "Text Similarity",
        description: "Semantic similarity with embeddings",
      },
      {
        slug: "ai-image-generator",
        title: "AI Image Generator",
        description: "Text-to-image with FLUX models",
      },
      {
        slug: "speech-to-text-transcriber",
        title: "Speech to Text",
        description: "Transcribe audio with Whisper",
      },
      {
        slug: "rag-mini-search",
        title: "RAG Mini Search",
        description: "Vectorize + Workers AI Q&A",
      },
      {
        slug: "ai-gateway-dashboard",
        title: "AI Gateway Dashboard",
        description: "Gateway cache and latency metadata",
      },
      {
        slug: "chat-agent",
        title: "Chat Agent",
        description: "Durable DO chat with optional Workers AI",
        status: "new",
      },
      {
        slug: "ai-search-demo",
        title: "AI Search Demo",
        description: "Managed RAG via Cloudflare AI Search",
        status: "new",
      },
      {
        slug: "ai-batch-infer",
        title: "AI Batch Infer",
        description: "Async batch embeddings with queueRequest",
        status: "new",
      },
      {
        slug: "mcp-tools-server",
        title: "MCP Tools Server",
        description: "Remote MCP tools for AI clients",
        status: "new",
      },
      {
        slug: "receipt-parser",
        title: "Receipt Parser",
        description: "Receipts to JSON via Workers AI",
        status: "new",
      },
      {
        slug: "article-to-audio",
        title: "Article to Audio",
        description: "Listen to any article as MP3",
        status: "new",
      },
      {
        slug: "natural-language-calendar",
        title: "Natural Language Calendar",
        description: "Plain English to .ics invite",
        status: "new",
      },
      {
        slug: "newsletter-digest",
        title: "Newsletter Digest",
        description: "AI-summarized daily newsletter digest",
        status: "new",
      },
    ],
  },
  {
    id: "scraping",
    title: "Web Scraping & Parsing",
    description: "Fetch, HTMLRewriter, metadata extraction, and structured page APIs.",
    icon: Code,
    accent: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    experiments: [
      {
        slug: "website-metadata-extractor",
        title: "Metadata Extractor",
        description: "Title, OG tags, canonical URL",
      },
      {
        slug: "website-to-api",
        title: "Website to API",
        description: "Structured JSON from any page",
      },
      {
        slug: "website-to-llms-txt",
        title: "Website to llms.txt",
        description: "LLM-friendly page export",
      },
      {
        slug: "website-devtools-inspector",
        title: "DevTools Inspector",
        description: "Headers, scripts, assets, cookies",
      },
      {
        slug: "dependency-analyzer",
        title: "Dependency Analyzer",
        description: "Scripts, styles, fonts, images",
      },
      {
        slug: "html-rewriter",
        title: "HTML Rewriter",
        description: "Stats and in-place HTML transforms",
      },
      {
        slug: "social-preview-inspector",
        title: "Social Preview Inspector",
        description: "Twitter, OG, Google previews",
      },
      {
        slug: "robots-sitemap-inspector",
        title: "Robots Sitemap Inspector",
        description: "Parse robots.txt and sitemaps",
      },
      {
        slug: "rss-atom-feed-parser",
        title: "RSS / Atom Feed Parser",
        description: "Normalize feeds to JSON",
      },
      {
        slug: "json-ld-extractor",
        title: "JSON-LD Extractor",
        description: "Schema.org structured data",
      },
      {
        slug: "html-to-markdown",
        title: "HTML to Markdown",
        description: "Convert pages to Markdown",
      },
    ],
  },
  {
    id: "browser",
    title: "Browser Rendering",
    description: "Fully rendered DOM via Puppeteer at the edge.",
    icon: Camera,
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    experiments: [
      { slug: "screenshot-api", title: "Screenshot API", description: "PNG captures of any URL" },
      { slug: "pdf-api", title: "PDF API", description: "Generate PDFs from webpages" },
      { slug: "page-metrics", title: "Page Metrics", description: "Load timing and heap stats" },
      { slug: "rendered-text", title: "Rendered Text", description: "JS-rendered visible text" },
      { slug: "browser-links", title: "Browser Links", description: "Links from rendered pages" },
      {
        slug: "browser-cdp-inspect",
        title: "Browser CDP Inspect",
        description: "Title, cookies, and performance via Puppeteer",
        status: "new",
      },
      {
        slug: "readability-extractor",
        title: "Readability Extractor",
        description: "Clean article body via Browser Rendering",
      },
      {
        slug: "browser-markdown-scrape",
        title: "Browser Markdown Scrape",
        description: "Markdown + CSS scrape via quickAction",
        status: "new",
      },
      {
        slug: "accessibility-auditor",
        title: "Accessibility Auditor",
        description: "axe-core WCAG audit + alt text",
        status: "new",
      },
      {
        slug: "privacy-tracker-scanner",
        title: "Privacy Tracker Scanner",
        description: "Pre-consent tracker detection",
        status: "new",
      },
    ],
  },
  {
    id: "network",
    title: "Network & Monitoring",
    description: "Reachability, DNS, TLS, latency, change tracking, and CORS debugging.",
    icon: Activity,
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    experiments: [
      { slug: "is-it-down", title: "Is It Down", description: "Edge reachability checks" },
      {
        slug: "url-dns-lookup",
        title: "URL DNS Lookup",
        description: "A, AAAA, MX, TXT, and more",
      },
      {
        slug: "email-auth-checker",
        title: "Email Auth Checker",
        description: "SPF, DMARC, and DKIM via DoH",
      },
      {
        slug: "edge-redirect-simulator",
        title: "Redirect Simulator",
        description: "Trace redirect chains",
      },
      { slug: "whereami", title: "Where Am I", description: "request.cf geolocation metadata" },
      {
        slug: "response-headers",
        title: "Response Headers",
        description: "Inspect response headers",
      },
      {
        slug: "security-headers-grader",
        title: "Security Headers Grader",
        description: "HSTS, CSP, and related grades",
      },
      {
        slug: "ssl-certificate-inspector",
        title: "SSL Certificate Inspector",
        description: "TLS cert metadata",
      },
      {
        slug: "multi-pop-latency-map",
        title: "Multi-PoP Latency Map",
        description: "Latency and serving colo",
      },
      {
        slug: "dns-propagation-checker",
        title: "DNS Propagation Checker",
        description: "Multi-resolver comparison",
      },
      {
        slug: "website-change-tracker",
        title: "Website Change Tracker",
        description: "R2 snapshots + D1 diffs",
      },
      {
        slug: "uptime-monitor-alerts",
        title: "Uptime Monitor Alerts",
        description: "Cron pings + email alerts",
      },
      {
        slug: "cors-preflight-tester",
        title: "CORS Preflight Tester",
        description: "Simulate OPTIONS preflight",
      },
      {
        slug: "broken-link-checker",
        title: "Broken Link Checker",
        description: "Link status codes from the edge",
      },
      {
        slug: "smart-placement-probe",
        title: "Smart Placement Probe",
        description: "Origin latency with Smart Placement",
        status: "new",
      },
      {
        slug: "domain-expiry-reminder",
        title: "Domain Expiry Reminder",
        description: "Domain and TLS expiry email alerts",
        status: "new",
      },
    ],
  },
  {
    id: "edge",
    title: "Edge Platform",
    description: "Cache, crypto, auth helpers, feature flags, Realtime, and platform APIs.",
    icon: ShieldCheck,
    accent: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    experiments: [
      { slug: "edge-cache", title: "Edge Cache", description: "Workers Cache API HIT/MISS" },
      { slug: "crypto-hash", title: "Crypto Hash", description: "SHA-256/384/512 digests" },
      { slug: "websocket-echo", title: "WebSocket Echo", description: "WebSocketPair echo server" },
      { slug: "image-resizer", title: "Image Resizer", description: "cf.image resizing" },
      {
        slug: "image-converter",
        title: "Image Converter",
        description: "Convert, resize, watermark via Images binding",
        status: "new",
      },
      {
        slug: "turnstile-verify",
        title: "Turnstile Verify",
        description: "Bot challenge verification",
      },
      { slug: "jwt-inspector", title: "JWT Inspector", description: "Decode, verify, issue JWTs" },
      {
        slug: "access-jwt-validator",
        title: "Access JWT Validator",
        description: "Verify Cloudflare Access JWTs",
        status: "new",
      },
      {
        slug: "rate-limiter-demo",
        title: "Rate Limiter Demo",
        description: "Native rate limiting binding",
      },
      {
        slug: "webhook-signature-verifier",
        title: "Webhook Signature Verifier",
        description: "HMAC timing-safe verify",
      },
      {
        slug: "flagship-rollout",
        title: "Flagship Rollout",
        description: "Edge feature flags via Flagship",
        status: "new",
      },
      {
        slug: "secrets-store-demo",
        title: "Secrets Store Demo",
        description: "Account-scoped Secrets Store binding",
        status: "new",
      },
      {
        slug: "tail-logger",
        title: "Tail Logger",
        description: "Tail Worker traces stored in KV",
        status: "new",
      },
      {
        slug: "webrtc-relay",
        title: "WebRTC Relay",
        description: "Realtime TURN credentials for WebRTC",
        status: "new",
      },
      {
        slug: "stream-video-demo",
        title: "Stream Video Demo",
        description: "Direct upload URLs and signed playback tokens",
        status: "new",
      },
      {
        slug: "static-assets-spa",
        title: "Static Assets SPA",
        description: "SPA with ASSETS binding and run_worker_first",
        status: "new",
      },
      {
        slug: "static-form-backend",
        title: "Static Form Backend",
        description: "Turnstile forms for static sites",
        status: "new",
      },
    ],
  },
  {
    id: "compute",
    title: "Compute & Isolation",
    description: "Containers, Sandbox SDK, Dynamic Workers, and Workers for Platforms dispatch.",
    icon: Boxes,
    accent: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    experiments: [
      {
        slug: "dynamic-worker-runner",
        title: "Dynamic Worker Runner",
        description: "Sandboxed JS via Worker Loader",
        status: "new",
      },
      {
        slug: "container-echo",
        title: "Container Echo",
        description: "Echo payloads via Cloudflare Containers",
        status: "new",
      },
      {
        slug: "code-sandbox",
        title: "Code Sandbox",
        description: "Isolated JS execution with Sandbox SDK",
        status: "new",
      },
      {
        slug: "user-script-dispatcher",
        title: "User Script Dispatcher",
        description: "Workers for Platforms style dispatch",
        status: "new",
      },
    ],
  },
  {
    id: "storage",
    title: "Storage & Data",
    description: "R2, D1, KV, Vectorize, Hyperdrive, Pipelines, and mock API patterns.",
    icon: HardDrive,
    accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    experiments: [
      { slug: "r2-storage", title: "R2 Storage", description: "List, get, put, delete objects" },
      { slug: "link-shortener", title: "Link Shortener", description: "D1 primary + KV cache" },
      {
        slug: "d1-sql-playground",
        title: "D1 SQL Playground",
        description: "Read-only SQL playground",
      },
      { slug: "kv-notes", title: "KV Notes", description: "Simple note storage" },
      {
        slug: "vectorize-search",
        title: "Vectorize Search",
        description: "Semantic vector search",
      },
      {
        slug: "presigned-r2-upload",
        title: "Presigned R2 Upload",
        description: "Browser-direct uploads",
      },
      {
        slug: "api-mock-server",
        title: "API Mock Server",
        description: "KV-backed mock endpoints",
      },
      {
        slug: "hyperdrive-sql-demo",
        title: "Hyperdrive SQL Demo",
        description: "PostgreSQL via Hyperdrive pooling",
      },
      {
        slug: "event-pipeline",
        title: "Event Pipeline",
        description: "Pipelines ingest with R2 fallback",
        status: "new",
      },
      {
        slug: "artifact-workspace",
        title: "Artifact Workspace",
        description: "Artifacts-style file workspace on R2",
        status: "new",
      },
      {
        slug: "r2-sql-query",
        title: "R2 SQL Query",
        description: "SQL over Iceberg via R2 SQL HTTP API",
        status: "new",
      },
    ],
  },
  {
    id: "stateful",
    title: "Stateful & Async",
    description: "Durable Objects, Cron, Queues, Workflows, Email, and Analytics Engine.",
    icon: Zap,
    accent: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    experiments: [
      {
        slug: "durable-counter",
        title: "Durable Counter",
        description: "Globally consistent counter",
      },
      {
        slug: "do-sqlite-notes",
        title: "DO SQLite Notes",
        description: "Per-user notes with DO sql.exec",
        status: "new",
      },
      {
        slug: "cron-heartbeat",
        title: "Cron Heartbeat",
        description: "Scheduled tasks + KV metadata",
      },
      { slug: "task-queue", title: "Task Queue", description: "Queues producer/consumer" },
      {
        slug: "analytics-engine",
        title: "Analytics Engine",
        description: "Custom analytics events",
      },
      {
        slug: "workflows-pipeline-demo",
        title: "Workflows Pipeline",
        description: "Fetch → AI → R2 pipeline",
      },
      {
        slug: "live-cursor-tracker",
        title: "Live Cursor Tracker",
        description: "Shared cursors over WebSocket",
      },
      {
        slug: "queue-job-visualizer",
        title: "Queue Job Visualizer",
        description: "Job status and retries",
      },
      {
        slug: "do-alarm-scheduler",
        title: "DO Alarm Scheduler",
        description: "One-off DO reminders",
      },
      {
        slug: "webhook-relay-inspector",
        title: "Webhook Relay Inspector",
        description: "Inbound webhook capture",
      },
      {
        slug: "email-worker-inbox",
        title: "Email Worker Inbox",
        description: "Inbound Email Workers + KV inspect",
      },
      {
        slug: "transactional-email",
        title: "Transactional Email",
        description: "Send mail via Email Service binding",
        status: "new",
      },
      {
        slug: "one-time-secret",
        title: "One-Time Secret",
        description: "Self-destructing secret links",
        status: "new",
      },
    ],
  },
];

export type HomeDocLink = {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
  /** Icon chip classes; full literals so Tailwind can detect them. */
  accent: string;
};

export const docLinks: HomeDocLink[] = [
  {
    title: "Quick Start",
    href: "quickstart",
    description: "Install, run locally, and deploy your first Worker in minutes.",
    icon: Rocket,
    accent: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  {
    title: "Philosophy",
    href: "philosophy",
    description: "Why experiments stay small, edge-first, and independently deployable.",
    icon: BookOpen,
    accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    title: "Self-Hosted",
    href: "self-hosted",
    description: "SaaS-style tools you run on your own Cloudflare account.",
    icon: Server,
    accent: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  {
    title: "Adding Experiments",
    href: "adding-experiments",
    description: "Scaffold a new Worker with the repo layout, tests, and docs checklist.",
    icon: PlusCircle,
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Code Standards",
    href: "code-standards",
    description: "TypeScript, Hono routes, validation, and JSON error conventions.",
    icon: FileCode,
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    title: "Deployment",
    href: "reference/deployment",
    description: "Deploy buttons, bindings, secrets, and Wrangler workflows.",
    icon: Zap,
    accent: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  {
    title: "Architecture",
    href: "reference/architecture",
    description: "Turborepo layout and how each experiment stays self-contained.",
    icon: Layers,
    accent: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  },
];
