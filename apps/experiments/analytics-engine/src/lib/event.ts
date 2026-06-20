import { MAX_EVENT_LENGTH } from "../constants/defaults";

export function validateEvent(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_EVENT_LENGTH) return null;
  return trimmed;
}

export function normalizeValue(input: unknown): number {
  if (typeof input === "number" && Number.isFinite(input)) {
    return input;
  }
  return 1;
}

export function normalizeTag(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim();
}
