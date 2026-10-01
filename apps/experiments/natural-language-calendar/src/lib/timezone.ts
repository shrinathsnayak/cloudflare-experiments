import type { LocalDateTime } from "../types/event";

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string): Intl.DateTimeFormat {
  let fmt = formatters.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "long",
    });
    formatters.set(timeZone, fmt);
  }
  return fmt;
}

/**
 * Returns a valid IANA name with corrected casing ("america/new_york" → "America/New_York"), or
 * null. Intl maps some current names to legacy aliases (Asia/Kolkata → Asia/Calcutta), so the
 * resolved name is only used when it differs from the input by case.
 */
export function canonicalTimeZone(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 64) return null;
  try {
    const resolved = new Intl.DateTimeFormat("en-US", { timeZone: trimmed }).resolvedOptions()
      .timeZone;
    return resolved.toLowerCase() === trimmed.toLowerCase() ? resolved : trimmed;
  } catch {
    return null;
  }
}

/** Wall-clock parts (and weekday name) of an instant in a time zone. */
export function zonedParts(date: Date, timeZone: string): LocalDateTime & { weekday: string } {
  const parts: Record<string, string> = {};
  for (const { type, value } of formatter(timeZone).formatToParts(date)) parts[type] = value;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: parts.weekday,
  };
}

function localAsUtcMs(local: LocalDateTime): number {
  return Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second);
}

function offsetMs(utcMs: number, timeZone: string): number {
  const wholeSecond = Math.floor(utcMs / 1000) * 1000;
  return localAsUtcMs(zonedParts(new Date(wholeSecond), timeZone)) - wholeSecond;
}

/**
 * Converts wall-clock time in `timeZone` to a UTC instant. The second pass corrects the offset
 * when the first guess lands on the other side of a DST transition.
 */
export function zonedTimeToUtc(local: LocalDateTime, timeZone: string): Date {
  const naive = localAsUtcMs(local);
  const firstOffset = offsetMs(naive, timeZone);
  let utc = naive - firstOffset;
  const secondOffset = offsetMs(utc, timeZone);
  if (secondOffset !== firstOffset) utc = naive - secondOffset;
  return new Date(utc);
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}

export function formatLocalDate(local: Pick<LocalDateTime, "year" | "month" | "day">): string {
  return `${pad(local.year, 4)}-${pad(local.month)}-${pad(local.day)}`;
}

export function formatLocalDateTime(local: LocalDateTime): string {
  return `${formatLocalDate(local)}T${pad(local.hour)}:${pad(local.minute)}:${pad(local.second)}`;
}

/** Adds days to a calendar date without involving time zones. */
export function addDays(local: LocalDateTime, days: number): LocalDateTime {
  const date = new Date(Date.UTC(local.year, local.month - 1, local.day + days));
  return {
    ...local,
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

/**
 * Parses "YYYY-MM-DD", "YYYY-MM-DDTHH:mm", or "YYYY-MM-DDTHH:mm:ss" as wall time. Any trailing
 * offset or "Z" is ignored because the model is asked for times in the user's zone.
 */
export function parseLocalDateTime(
  input: unknown
): { local: LocalDateTime; hasTime: boolean } | null {
  if (typeof input !== "string") return null;
  const match =
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/i.exec(
      input.trim()
    );
  if (!match) return null;

  const [, y, mo, d, h, mi, s] = match;
  const local: LocalDateTime = {
    year: Number(y),
    month: Number(mo),
    day: Number(d),
    hour: h ? Number(h) : 0,
    minute: mi ? Number(mi) : 0,
    second: s ? Number(s) : 0,
  };
  const check = new Date(localAsUtcMs(local));
  const valid =
    local.hour < 24 &&
    local.minute < 60 &&
    local.second < 60 &&
    check.getUTCFullYear() === local.year &&
    check.getUTCMonth() === local.month - 1 &&
    check.getUTCDate() === local.day;
  return valid ? { local, hasTime: Boolean(h) } : null;
}

export function compareDates(a: LocalDateTime, b: LocalDateTime): number {
  return localAsUtcMs(a) - localAsUtcMs(b);
}
