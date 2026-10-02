/** Deepgram Aura-2 streams raw MP3 frames (no ID3/Xing header), so segments concatenate cleanly. */
export const TTS_MODELS = {
  en: "@cf/deepgram/aura-2-en",
  es: "@cf/deepgram/aura-2-es",
} as const;
export const SUPPORTED_LANGS = ["en", "es"] as const;
export const DEFAULT_LANG = "en";

/**
 * Aura rejects input over 2,000 characters. Chunks run in parallel and the longest one dominates
 * latency, so ~1k-char chunks keep a 6-chunk article around 30s.
 */
export const CHUNK_CHARS = 1_000;
export const MAX_CHUNKS = 6;
export const MAX_CHARS = CHUNK_CHARS * MAX_CHUNKS;

export const FETCH_TIMEOUT_MS = 15_000;
export const USER_AGENT =
  "Mozilla/5.0 (compatible; ArticleToAudio/1.0; +https://workers.cloudflare.com)";
export const ALLOWED_SCHEMES = ["http:", "https:"] as const;

export const CACHE_KEY_PREFIX = "audio/";
export const AUDIO_CACHE_CONTROL = "public, max-age=86400";

export const SKIP_SELECTOR = "nav, footer, aside, script, style, noscript, template, svg, form";
export const CONTAINER_SELECTOR = "article, main, [role=main]";
export const BLOCK_SELECTOR = "p, h1, h2, h3";
