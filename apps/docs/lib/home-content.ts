import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BrainCircuit,
  Camera,
  Clock,
  Code,
  Database,
  FileCode,
  Globe,
  HardDrive,
  Layers,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export type HomeExperiment = {
  slug: string;
  title: string;
  description: string;
};

export type HomeCategory = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  experiments: HomeExperiment[];
};

export const homeStats = [
  { value: "60+", label: "Experiments" },
  { value: "7", label: "Categories" },
  { value: "15+", label: "Cloudflare products" },
  { value: "MIT", label: "Open source" },
] as const;

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
      "Browse by category - AI, scraping, monitoring, storage - or search docs by binding name like d1 or r2.",
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

export const featuredExperiments: HomeExperiment[] = [
  {
    slug: "ai-website-summary",
    title: "AI Website Summary",
    description: "Summarize any webpage with Workers AI",
  },
  {
    slug: "screenshot-api",
    title: "Screenshot API",
    description: "Capture PNG screenshots via Browser Rendering",
  },
  {
    slug: "social-preview-inspector",
    title: "Social Preview Inspector",
    description: "Validate Twitter, Open Graph, and Google snippets",
  },
  {
    slug: "d1-sql-playground",
    title: "D1 SQL Playground",
    description: "Read-only SQL over a seeded edge database",
  },
  {
    slug: "rag-mini-search",
    title: "RAG Mini Search",
    description: "Vectorize retrieval + Workers AI grounded Q&A",
  },
  {
    slug: "uptime-monitor-alerts",
    title: "Uptime Monitor Alerts",
    description: "Cron checks, D1 history, email on downtime",
  },
  {
    slug: "webhook-relay-inspector",
    title: "Webhook Relay Inspector",
    description: "Capture inbound webhooks in a Durable Object session",
  },
  {
    slug: "dns-propagation-checker",
    title: "DNS Propagation Checker",
    description: "Compare Cloudflare, Google, and Quad9 resolver answers",
  },
];

export const platformCapabilities = [
  {
    icon: BrainCircuit,
    title: "Workers AI & Gateway",
    description:
      "Summarization, translation, embeddings, image generation, speech-to-text, and AI Gateway caching.",
    href: "experiments/ai-website-summary",
  },
  {
    icon: Camera,
    title: "Browser Rendering",
    description:
      "Headless Chrome at the edge for screenshots, PDFs, metrics, and JS-rendered content extraction.",
    href: "experiments/screenshot-api",
  },
  {
    icon: FileCode,
    title: "HTMLRewriter",
    description:
      "Parse and transform HTML without a browser - metadata, stats, social tags, and rewrites.",
    href: "experiments/html-rewriter",
  },
  {
    icon: Globe,
    title: "Edge networking",
    description:
      "DNS lookup, propagation checks, uptime monitoring, CORS testing, TLS inspection, and geolocation.",
    href: "experiments/is-it-down",
  },
  {
    icon: Database,
    title: "D1, KV & Vectorize",
    description:
      "Edge SQL, key-value storage, semantic search, mock APIs, and short links with cache layers.",
    href: "experiments/d1-sql-playground",
  },
  {
    icon: HardDrive,
    title: "R2 object storage",
    description:
      "Private and public buckets, presigned uploads, and snapshot storage for change tracking.",
    href: "experiments/r2-storage",
  },
  {
    icon: Layers,
    title: "Durable Objects",
    description:
      "Strongly consistent state, WebSockets, alarms, and webhook capture sessions at the edge.",
    href: "experiments/durable-counter",
  },
  {
    icon: Clock,
    title: "Cron & Queues",
    description:
      "Scheduled handlers, background job processing, retries, and pipeline orchestration.",
    href: "experiments/cron-heartbeat",
  },
] as const;

export const cloudflareBindings = [
  "AI",
  "BROWSER",
  "D1",
  "KV",
  "R2",
  "DO",
  "QUEUE",
  "VECTORIZE",
  "CRON",
  "CACHE",
  "EMAIL",
  "WORKFLOW",
  "ANALYTICS",
  "RATE_LIMITER",
] as const;

export const homeCategories: HomeCategory[] = [
  {
    id: "ai",
    title: "AI & Machine Learning",
    description: "Workers AI, embeddings, RAG, image generation, and AI Gateway patterns.",
    icon: Sparkles,
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
    ],
  },
  {
    id: "scraping",
    title: "Web Scraping & Parsing",
    description: "Fetch, HTMLRewriter, metadata extraction, and structured page APIs.",
    icon: Code,
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
        slug: "readability-extractor",
        title: "Readability Extractor",
        description: "Clean article body extraction",
      },
    ],
  },
  {
    id: "browser",
    title: "Browser Rendering",
    description: "Fully rendered DOM via Puppeteer at the edge.",
    icon: Camera,
    experiments: [
      { slug: "screenshot-api", title: "Screenshot API", description: "PNG captures of any URL" },
      { slug: "pdf-api", title: "PDF API", description: "Generate PDFs from webpages" },
      { slug: "page-metrics", title: "Page Metrics", description: "Load timing and heap stats" },
      { slug: "rendered-text", title: "Rendered Text", description: "JS-rendered visible text" },
      { slug: "browser-links", title: "Browser Links", description: "Links from rendered pages" },
    ],
  },
  {
    id: "network",
    title: "Network & Monitoring",
    description: "Reachability, DNS, TLS, latency, change tracking, and CORS debugging.",
    icon: Activity,
    experiments: [
      { slug: "is-it-down", title: "Is It Down", description: "Edge reachability checks" },
      {
        slug: "url-dns-lookup",
        title: "URL DNS Lookup",
        description: "A, AAAA, MX, TXT, and more",
      },
      {
        slug: "dns-propagation-checker",
        title: "DNS Propagation Checker",
        description: "Multi-resolver comparison",
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
    ],
  },
  {
    id: "edge",
    title: "Edge Platform",
    description: "Web Crypto, caching, WebSockets, auth helpers, and platform APIs.",
    icon: ShieldCheck,
    experiments: [
      { slug: "edge-cache", title: "Edge Cache", description: "Workers Cache API HIT/MISS" },
      { slug: "crypto-hash", title: "Crypto Hash", description: "SHA-256/384/512 digests" },
      { slug: "websocket-echo", title: "WebSocket Echo", description: "WebSocketPair echo server" },
      { slug: "image-resizer", title: "Image Resizer", description: "cf.image resizing" },
      {
        slug: "turnstile-verify",
        title: "Turnstile Verify",
        description: "Bot challenge verification",
      },
      { slug: "jwt-inspector", title: "JWT Inspector", description: "Decode, verify, issue JWTs" },
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
    ],
  },
  {
    id: "storage",
    title: "Storage & Data",
    description: "R2, D1, KV, Vectorize, and mock API patterns.",
    icon: HardDrive,
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
    ],
  },
  {
    id: "stateful",
    title: "Stateful & Async",
    description: "Durable Objects, Cron, Queues, Workflows, and Analytics Engine.",
    icon: Zap,
    experiments: [
      {
        slug: "durable-counter",
        title: "Durable Counter",
        description: "Globally consistent counter",
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
    ],
  },
];

export const repoStructure = [
  { path: "apps/experiments/<name>/", label: "Standalone Worker package" },
  { path: "src/routes/", label: "Hono route handlers" },
  { path: "src/lib/", label: "Domain logic" },
  { path: "test/", label: "Vitest smoke + unit tests" },
  { path: "wrangler.json", label: "Bindings and config" },
] as const;

export const docLinks = [
  { title: "Quick Start", href: "quickstart", description: "Install, dev, and deploy" },
  { title: "Philosophy", href: "philosophy", description: "Why this project exists" },
  { title: "Adding Experiments", href: "adding-experiments", description: "Scaffold a new Worker" },
  {
    title: "Code Standards",
    href: "code-standards",
    description: "TypeScript and API conventions",
  },
  { title: "Deployment", href: "reference/deployment", description: "Deploy button and bindings" },
  {
    title: "Architecture",
    href: "reference/architecture",
    description: "Monorepo layout patterns",
  },
] as const;
