/**
 * Known AI crawlers: id (User-Agent token) and human-readable platform name.
 * Based on Cloudflare AI Crawl Control reference and common AI bots.
 */
export const AI_CRAWLERS: Array<{ id: string; platform: string }> = [
  { id: "GPTBot", platform: "ChatGPT" },
  { id: "ChatGPT-User", platform: "ChatGPT" },
  { id: "OAI-SearchBot", platform: "ChatGPT Search" },
  { id: "ClaudeBot", platform: "Claude" },
  { id: "PerplexityBot", platform: "Perplexity" },
  { id: "Google-Extended", platform: "Google (Gemini/Bard)" },
  { id: "Google-CloudVertexBot", platform: "Google Vertex AI" },
  { id: "CCBot", platform: "Common Crawl" },
  { id: "Bytespider", platform: "ByteDance" },
  { id: "Meta-ExternalAgent", platform: "Meta AI" },
  { id: "FacebookBot", platform: "Meta" },
  { id: "Applebot", platform: "Apple" },
  { id: "Amazonbot", platform: "Amazon" },
  { id: "DuckAssistBot", platform: "DuckDuckGo" },
];
