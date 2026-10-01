import { Hono } from "hono";
import type { Env } from "../types/env";
import type { ExtractedArticle } from "../types/article";
import { AUDIO_CACHE_CONTROL, SUPPORTED_LANGS, TTS_MODELS } from "../constants/defaults";
import { validateUrl } from "../lib/url";
import { fetchArticle, NotHtmlError } from "../lib/extract";
import { prepareArticle } from "../lib/text";
import { synthesizeSpeech, validateLang } from "../lib/tts";
import { cacheKey } from "../lib/cache";
import { jsonError } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

function audioHeaders(cache: "HIT" | "MISS", length: number): HeadersInit {
  return {
    "Content-Type": "audio/mpeg",
    "Content-Length": String(length),
    "Cache-Control": AUDIO_CACHE_CONTROL,
    "X-Cache": cache,
  };
}

app.get("/listen", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");

  const lang = validateLang(c.req.query("lang"));
  if (!lang) {
    return jsonError(
      c,
      `Query parameter lang must be one of: ${SUPPORTED_LANGS.join(", ")}`,
      "INVALID_LANG"
    );
  }

  const key = await cacheKey(url, lang, TTS_MODELS[lang]);
  const cached = await c.env.AUDIO_CACHE.get(key);
  if (cached) {
    return new Response(cached.body, { headers: audioHeaders("HIT", cached.size) });
  }

  let extracted: ExtractedArticle;
  try {
    extracted = await fetchArticle(url);
  } catch (err) {
    if (err instanceof NotHtmlError) return jsonError(c, err.message, "NO_CONTENT");
    const message = err instanceof Error ? err.message : "Failed to fetch page";
    return jsonError(c, message, "FETCH_ERROR", 502);
  }

  const article = prepareArticle(extracted);
  if (!article.text) {
    return jsonError(c, "No readable article text found at url", "NO_CONTENT", 404);
  }

  let audio: Uint8Array;
  try {
    audio = await synthesizeSpeech(c.env.AI, article.chunks, lang);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Speech synthesis failed";
    return jsonError(c, message, "TTS_ERROR", 502);
  }

  try {
    await c.env.AUDIO_CACHE.put(key, audio, {
      httpMetadata: { contentType: "audio/mpeg" },
      customMetadata: {
        url,
        lang,
        model: TTS_MODELS[lang],
        title: (article.title ?? "").slice(0, 200),
        chars: String(article.chars),
      },
    });
  } catch (err) {
    console.error("Failed to cache audio", err);
  }

  return new Response(audio, { headers: audioHeaders("MISS", audio.length) });
});

export default app;
