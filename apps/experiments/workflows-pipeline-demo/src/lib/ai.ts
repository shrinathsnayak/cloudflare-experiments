import type { Env } from "../types/env";
import { AI_MODEL, MAX_SUMMARY_TOKENS } from "../constants/defaults";

export async function summarizeText(env: Env, text: string, title: string | null): Promise<string> {
  const prompt = `Summarize the following webpage in 2-4 concise sentences. Reply with only the summary.\n\n${title ? `Title: ${title}\n\n` : ""}${text}`;
  const out = await env.AI.run(AI_MODEL, {
    prompt,
    max_tokens: MAX_SUMMARY_TOKENS,
  });
  const response =
    (out as { response?: string }).response ?? (out as { result?: string }).result ?? "";
  return response.trim();
}
