import { MAX_TOKENS_CAP } from "../constants/defaults";

export function validateModel(model: unknown): string | null {
  if (typeof model !== "string" || !model.trim()) return null;
  return model.trim();
}

export function validatePrompt(prompt: unknown): string | null {
  if (prompt === undefined || prompt === null) return null;
  if (typeof prompt !== "string" || !prompt.trim()) return null;
  return prompt.trim();
}

export function validateMessages(
  messages: unknown
): Array<{ role: string; content: string }> | null {
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const out: Array<{ role: string; content: string }> = [];
  for (const m of messages) {
    if (typeof m !== "object" || m === null) return null;
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if (typeof role !== "string" || typeof content !== "string") return null;
    out.push({ role: role.trim(), content: content.trim() });
  }
  return out;
}

export function validateMaxTokens(max_tokens: unknown): number | undefined {
  if (max_tokens === undefined || max_tokens === null) return undefined;
  const n = Number(max_tokens);
  if (!Number.isInteger(n) || n < 1 || n > MAX_TOKENS_CAP) return undefined;
  return n;
}

export { MAX_TOKENS_CAP };
