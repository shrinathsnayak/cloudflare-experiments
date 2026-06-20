import { MAX_TEXT_LENGTH } from "../constants/defaults";

export function truncateText(text: string): { text: string; truncated: boolean } {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= MAX_TEXT_LENGTH) {
    return { text: normalized, truncated: false };
  }
  return {
    text: normalized.slice(0, MAX_TEXT_LENGTH),
    truncated: true,
  };
}

export function normalizeTitle(title: string): string {
  return title.trim();
}
