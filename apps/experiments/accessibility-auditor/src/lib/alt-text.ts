import { ALT_TEXT_MAX_TOKENS, ALT_TEXT_PROMPT, VISION_MODEL } from "../constants/defaults";
import type { AltSuggestion } from "../types/audit";
import { fetchImage } from "./image";

export function cleanAltText(text: string): string {
  return text
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/^(an?\s+)?(image|picture|photo)\s+of\s+/i, "")
    .trim();
}

export async function generateAltText(ai: Ai, bytes: Uint8Array): Promise<string> {
  const result = await ai.run(VISION_MODEL, {
    image: Array.from(bytes),
    prompt: ALT_TEXT_PROMPT,
    max_tokens: ALT_TEXT_MAX_TOKENS,
  });
  const altText = cleanAltText(result.description ?? "");
  if (!altText) throw new Error("Model returned an empty description");
  return altText;
}

/** Best-effort: per-image failures are reported inline instead of failing the audit. */
export async function suggestAltTexts(ai: Ai, srcs: string[]): Promise<AltSuggestion[]> {
  return Promise.all(
    srcs.map(async (src): Promise<AltSuggestion> => {
      const image = await fetchImage(src);
      if (!image.ok) return { src, suggestion: null, error: image.message };
      try {
        return { src, suggestion: await generateAltText(ai, image.bytes) };
      } catch (e) {
        return {
          src,
          suggestion: null,
          error: e instanceof Error ? e.message : "Alt text generation failed",
        };
      }
    })
  );
}
