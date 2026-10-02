/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /listen?url=https://blog.cloudflare.com/markdown-for-agents/
 */
import { fetchArticle } from "../src/lib/extract";
import { prepareArticle } from "../src/lib/text";
import { synthesizeSpeech } from "../src/lib/tts";
import { cacheKey } from "../src/lib/cache";
import { TTS_MODELS } from "../src/constants/defaults";

export default {
  async fetch(request: Request, env: { AI: Ai; AUDIO_CACHE: R2Bucket }): Promise<Response> {
    const url = new URL(request.url).searchParams.get("url");
    if (!url) return Response.json({ error: "Missing url", code: "INVALID_URL" }, { status: 400 });

    const key = await cacheKey(url, "en", TTS_MODELS.en);
    const cached = await env.AUDIO_CACHE.get(key);
    if (cached) return new Response(cached.body, { headers: { "Content-Type": "audio/mpeg" } });

    const article = prepareArticle(await fetchArticle(url));
    const audio = await synthesizeSpeech(env.AI, article.chunks, "en");
    await env.AUDIO_CACHE.put(key, audio, { httpMetadata: { contentType: "audio/mpeg" } });
    return new Response(audio, { headers: { "Content-Type": "audio/mpeg" } });
  },
};
