import { DEFAULT_TIMEZONE, MAX_TEXT_LENGTH } from "../constants/defaults";
import { canonicalTimeZone } from "./timezone";

export function validateText(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  return trimmed && trimmed.length <= MAX_TEXT_LENGTH ? trimmed : null;
}

/**
 * An explicit timezone must be valid; otherwise fall back to the visitor's `request.cf.timezone`,
 * then UTC. Returns null only for an invalid explicit value.
 */
export function resolveTimeZone(explicit: unknown, cfTimezone: unknown): string | null {
  if (explicit !== undefined && explicit !== null && explicit !== "") {
    return typeof explicit === "string" ? canonicalTimeZone(explicit) : null;
  }
  if (typeof cfTimezone === "string") {
    const fromCf = canonicalTimeZone(cfTimezone);
    if (fromCf) return fromCf;
  }
  return DEFAULT_TIMEZONE;
}

/** Optional reference time for deterministic parsing; defaults to the current time. */
export function resolveNow(input: unknown): Date | null {
  if (input === undefined || input === null || input === "") return new Date();
  if (typeof input !== "string") return null;
  const date = new Date(input);
  return Number.isFinite(date.getTime()) ? date : null;
}
