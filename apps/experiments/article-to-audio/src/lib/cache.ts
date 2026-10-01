import { CACHE_KEY_PREFIX } from "../constants/defaults";

/** R2 key for a synthesized article: SHA-256 of model, lang, and URL. */
export async function cacheKey(url: string, lang: string, model: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${model}\n${lang}\n${url}`)
  );
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
  return `${CACHE_KEY_PREFIX}${hex}.mp3`;
}
