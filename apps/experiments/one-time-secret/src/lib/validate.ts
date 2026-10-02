import {
  DEFAULT_TTL_SECONDS,
  ID_BYTES,
  KEY_BYTES,
  MAX_SECRET_LENGTH,
  MAX_TTL_SECONDS,
  MIN_TTL_SECONDS,
} from "../constants/defaults";

const base64UrlPattern = (bytes: number) =>
  new RegExp(`^[A-Za-z0-9_-]{${Math.ceil((bytes * 4) / 3)}}$`);
const ID_PATTERN = base64UrlPattern(ID_BYTES);
const KEY_PATTERN = base64UrlPattern(KEY_BYTES);

export function validateSecret(input: unknown): string | null {
  return typeof input === "string" && input.length > 0 && input.length <= MAX_SECRET_LENGTH
    ? input
    : null;
}

/** Returns the TTL in seconds (default when omitted), or null when out of range. */
export function validateTtl(input: unknown): number | null {
  if (input === undefined) return DEFAULT_TTL_SECONDS;
  if (typeof input !== "number" || !Number.isInteger(input)) return null;
  return input >= MIN_TTL_SECONDS && input <= MAX_TTL_SECONDS ? input : null;
}

export function isValidId(id: string): boolean {
  return ID_PATTERN.test(id);
}

export function isValidKey(key: unknown): key is string {
  return typeof key === "string" && KEY_PATTERN.test(key);
}
