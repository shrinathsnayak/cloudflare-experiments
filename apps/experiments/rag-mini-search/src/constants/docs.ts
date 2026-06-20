export type SeedDocument = {
  id: string;
  title: string;
  text: string;
};

export const SEED_DOCUMENTS: SeedDocument[] = [
  {
    id: "is-it-down",
    title: "Is It Down",
    text: "Check if a website is reachable from Cloudflare edge. Returns response time and status code.",
  },
  {
    id: "link-shortener",
    title: "Link Shortener",
    text: "Shorten URLs with D1 as primary storage and KV read-through cache for redirects.",
  },
  {
    id: "cloud-ai-proxy",
    title: "Cloud AI Proxy",
    text: "Call Workers AI with any supported model and prompt from a single HTTP endpoint.",
  },
  {
    id: "vectorize-search",
    title: "Vectorize Search",
    text: "Semantic search using Workers AI embeddings stored in a Vectorize index.",
  },
  {
    id: "durable-counter",
    title: "Durable Counter",
    text: "Globally consistent counter using Durable Objects with persistent storage.",
  },
  {
    id: "task-queue",
    title: "Task Queue",
    text: "Enqueue background tasks with Cloudflare Queues and track stats in KV.",
  },
  {
    id: "screenshot-api",
    title: "Screenshot API",
    text: "Capture PNG screenshots of webpages using Browser Rendering at the edge.",
  },
  {
    id: "edge-cache",
    title: "Edge Cache",
    text: "Fetch URLs through the Workers Cache API and report HIT, MISS, or BYPASS.",
  },
  {
    id: "crypto-hash",
    title: "Crypto Hash",
    text: "Compute SHA-256, SHA-384, and SHA-512 digests with the Web Crypto API.",
  },
  {
    id: "websocket-echo",
    title: "WebSocket Echo",
    text: "WebSocket echo server demonstrating WebSocketPair upgrades on Workers.",
  },
];
