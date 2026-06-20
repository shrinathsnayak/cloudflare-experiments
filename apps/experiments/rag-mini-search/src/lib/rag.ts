import type { Env } from "../types/env";
import { AI_CHAT_MODEL } from "../constants/defaults";

export async function generateGroundedAnswer(
  env: Env,
  question: string,
  contextBlocks: { title: string; text: string }[]
): Promise<string> {
  const context = contextBlocks
    .map((block, index) => `[${index + 1}] ${block.title}: ${block.text}`)
    .join("\n");

  const prompt = `Answer the question using ONLY the context below. Cite source titles in parentheses. If the context is insufficient, say you don't know.

Context:
${context}

Question: ${question}

Answer:`;

  const out = await env.AI.run(AI_CHAT_MODEL, { prompt, max_tokens: 300 });
  const response =
    (out as { response?: string }).response ?? (out as { result?: string }).result ?? "";
  return response.trim();
}
