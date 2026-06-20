import { MAX_PROMPT_LENGTH } from "../constants/defaults";

export function validatePrompt(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_PROMPT_LENGTH) return null;
  return trimmed;
}
