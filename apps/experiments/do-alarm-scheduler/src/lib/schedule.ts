export const MIN_SECONDS = 1;
export const MAX_SECONDS = 300;

export function validateSeconds(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const rounded = Math.floor(value);
  if (rounded < MIN_SECONDS || rounded > MAX_SECONDS) return null;
  return rounded;
}

export function validateMessage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 500) return null;
  return trimmed;
}
