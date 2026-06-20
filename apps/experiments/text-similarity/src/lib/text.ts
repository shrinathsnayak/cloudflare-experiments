import { MAX_TEXT_LENGTH } from "../constants/defaults";

export function validateText(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_TEXT_LENGTH) return null;
  return trimmed;
}
