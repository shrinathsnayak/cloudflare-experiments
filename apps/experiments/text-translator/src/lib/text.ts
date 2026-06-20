import { DEFAULT_SOURCE_LANG, MAX_TEXT_LENGTH } from "../constants/defaults";

export function validateText(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_TEXT_LENGTH) return null;
  return trimmed;
}

export function validateLang(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim().toLowerCase();
  if (!trimmed || trimmed.length > 20) return null;
  return trimmed;
}

export function resolveSourceLang(input: string | undefined): string | null {
  if (input === undefined) return DEFAULT_SOURCE_LANG;
  return validateLang(input);
}
