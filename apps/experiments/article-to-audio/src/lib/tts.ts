import { DEFAULT_LANG, SUPPORTED_LANGS, TTS_MODELS } from "../constants/defaults";
import type { Lang } from "../types/article";

export function validateLang(input: string | undefined): Lang | null {
  const lang = (input ?? DEFAULT_LANG).trim().toLowerCase();
  return (SUPPORTED_LANGS as readonly string[]).includes(lang) ? (lang as Lang) : null;
}

/** Aura is typed as returning a string but actually resolves to a ReadableStream of MP3 bytes. */
export async function readAudio(output: unknown): Promise<Uint8Array> {
  if (output instanceof Uint8Array) return output;
  if (output instanceof ArrayBuffer) return new Uint8Array(output);
  const body = output instanceof Response ? output.body : output;
  if (body instanceof ReadableStream) {
    const bytes = new Uint8Array(await new Response(body).arrayBuffer());
    if (bytes.length > 0) return bytes;
  }
  throw new Error("TTS model returned no audio");
}

export function concatBytes(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** Synthesizes each chunk in parallel and joins the MP3 segments in order. */
export async function synthesizeSpeech(ai: Ai, chunks: string[], lang: Lang): Promise<Uint8Array> {
  const parts = await Promise.all(
    chunks.map(async (text) => readAudio(await ai.run(TTS_MODELS[lang], { text, encoding: "mp3" })))
  );
  return concatBytes(parts);
}
