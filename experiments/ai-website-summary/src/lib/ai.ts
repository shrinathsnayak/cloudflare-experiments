import type { Env } from "../types/env";
import { AI_MODEL, MAX_SUMMARY_TOKENS } from "../constants/defaults";

const BOILERPLATE_PREFIXES = [
  /^the content appears to be[^.]*\.\s*/i,
  /^here is a (2-4 sentence |brief )?summary:?\s*/i,
  /^summary:?\s*/i,
];
const BOILERPLATE_SUFFIX = /\s*let me know if you need any further assistance!?\.?\s*$/i;

function extractSummaryOnly(raw: string): string {
  let s = raw.trim();
  for (const re of BOILERPLATE_PREFIXES) {
    s = s.replace(re, "");
  }
  s = s.replace(BOILERPLATE_SUFFIX, "");
  return s.trim();
}

export async function summarizeWithAi(env: Env, text: string, title: string | null): Promise<string> {
  const prompt = `Summarize the following webpage content in exactly 2-4 concise sentences. Reply with ONLY those sentences—no preamble, no labels like "Summary:" or "Here is a summary", no JSON, and no closing phrases like "Let me know if you need assistance."\n\n${title ? `Page title: ${title}\n\n` : ""}Content:\n${text}`;
  const out = await env.AI.run(AI_MODEL, {
    prompt,
    max_tokens: MAX_SUMMARY_TOKENS,
  });
  const response = (out as { response?: string }).response ?? (out as { result?: string }).result ?? "";
  return extractSummaryOnly(response);
}
