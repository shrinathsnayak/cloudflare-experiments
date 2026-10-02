import {
  AI_INPUT_CHARS,
  AI_MAX_TOKENS,
  AI_MODEL,
  FALLBACK_SUMMARY_CHARS,
} from "../constants/defaults";
import type { AiBinding } from "../types/env";

const SYSTEM_PROMPT =
  "You summarize newsletters. Reply with 2 or 3 short bullet points, each starting with '- ', covering the most important points. No preamble, no closing remarks, no links.";

export function fallbackSummary(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= FALLBACK_SUMMARY_CHARS) return flat;
  return `${flat.slice(0, FALLBACK_SUMMARY_CHARS).trimEnd()}…`;
}

function normalizeBullets(raw: string): string | null {
  const bullets = raw
    .split("\n")
    .map((line) => line.trim().replace(/^(?:[-*•]|\d+[.)])\s*/, ""))
    .filter((line) => line && !/^here (is|are)\b/i.test(line))
    .slice(0, 3);
  return bullets.length ? bullets.map((b) => `- ${b}`).join("\n") : null;
}

export async function summarizeNewsletter(
  ai: AiBinding,
  subject: string,
  text: string
): Promise<{ summary: string; usedAi: boolean }> {
  if (!text.trim()) return { summary: subject, usedAi: false };
  try {
    const out = await ai.run(AI_MODEL, {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Subject: ${subject}\n\n${text.slice(0, AI_INPUT_CHARS)}` },
      ],
      max_tokens: AI_MAX_TOKENS,
    });
    const response = (out as { response?: unknown } | null)?.response;
    const summary = typeof response === "string" ? normalizeBullets(response) : null;
    if (summary) return { summary, usedAi: true };
  } catch (error) {
    console.error("Workers AI summarization failed", error);
  }
  return { summary: fallbackSummary(text), usedAi: false };
}
