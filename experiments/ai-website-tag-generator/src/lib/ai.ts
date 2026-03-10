import type { Env } from "../types/env";
import { AI_MODEL, MAX_TAG_TOKENS, MAX_TAGS } from "../constants/defaults";

/**
 * Parse AI response into lowercase tags: split on newlines and commas, trim, dedupe, cap.
 */
function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  const parts = raw
    .split(/[\n,]+/)
    .map((s) =>
      s
        .replace(/^[\d.)\s\-*]+/, "")
        .trim()
        .toLowerCase()
    )
    .filter(Boolean);
  for (const tag of parts) {
    const normalized = tag.replace(/\s+/g, "-").slice(0, 50);
    if (normalized && !seen.has(normalized) && tags.length < MAX_TAGS) {
      seen.add(normalized);
      tags.push(normalized);
    }
  }
  return tags;
}

export async function generateTagsWithAi(
  env: Env,
  text: string,
  title: string | null
): Promise<string[]> {
  const prompt = `You are a tag generator. Based on the following webpage content, output 3 to 10 short topic tags. Use single words or short hyphenated phrases (e.g. "machine-learning"). Output ONLY the tags: one per line or comma-separated. No numbering, no preamble, no "Tags:" label, no explanation.
${title ? `Page title: ${title}\n\n` : ""}Content:\n${text}`;

  const out = await env.AI.run(AI_MODEL, {
    prompt,
    max_tokens: MAX_TAG_TOKENS,
  });
  const response =
    (out as { response?: string }).response ?? (out as { result?: string }).result ?? "";
  const tags = parseTags(response);
  return tags.length > 0 ? tags : ["uncategorized"];
}
