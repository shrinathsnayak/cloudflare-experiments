import { MAX_BODY_LENGTH, WORDS_PER_MINUTE } from "../constants/defaults";
import type { RawReadabilityContent } from "../types/extract";

export function normalizeTitle(title: string): string {
  return title.trim();
}

export function normalizeBody(body: string): string {
  const normalized = body.replace(/\s+/g, " ").trim();
  if (normalized.length <= MAX_BODY_LENGTH) {
    return normalized;
  }
  return normalized.slice(0, MAX_BODY_LENGTH);
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function calculateReadTimeMinutes(wordCount: number): number {
  if (wordCount === 0) return 0;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function buildExtractResponse(
  url: string,
  raw: RawReadabilityContent
): {
  url: string;
  title: string;
  author: string | null;
  body: string;
  wordCount: number;
  readTimeMinutes: number;
} {
  const body = normalizeBody(raw.body);
  const wordCount = countWords(body);
  return {
    url,
    title: normalizeTitle(raw.title),
    author: raw.author?.trim() || null,
    body,
    wordCount,
    readTimeMinutes: calculateReadTimeMinutes(wordCount),
  };
}
