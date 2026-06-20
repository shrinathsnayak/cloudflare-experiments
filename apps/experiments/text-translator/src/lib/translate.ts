import type { Env } from "../types/env";
import { AI_MODEL } from "../constants/defaults";

type TranslateAiResult = {
  translated_text?: string;
};

export async function translateText(
  env: Env,
  text: string,
  source: string,
  target: string
): Promise<string> {
  const out = (await env.AI.run(AI_MODEL, {
    text,
    source_lang: source,
    target_lang: target,
  })) as TranslateAiResult;

  const translation = out.translated_text?.trim();
  if (!translation) {
    throw new Error("Translation model returned no text");
  }
  return translation;
}
