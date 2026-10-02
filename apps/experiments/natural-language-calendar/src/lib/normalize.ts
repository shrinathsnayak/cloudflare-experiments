import {
  DEFAULT_DURATION_MINUTES,
  MAX_ATTENDEES,
  MAX_DURATION_MINUTES,
  MAX_FIELD_LENGTH,
  MAX_TITLE_LENGTH,
} from "../constants/defaults";
import type { CalendarEvent, LocalDateTime } from "../types/event";
import {
  addDays,
  compareDates,
  formatLocalDate,
  formatLocalDateTime,
  parseLocalDateTime,
  zonedParts,
  zonedTimeToUtc,
} from "./timezone";

const EMAIL_PATTERN = /^[^\s@<>(),;:"]+@[^\s@<>(),;:"]+\.[a-z]{2,}$/i;
const MINUTE_MS = 60_000;

function toText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

/** Keeps only valid emails that literally appear in the user's text, so invented ones are dropped. */
export function normalizeAttendees(value: unknown, sourceText: string): string[] {
  if (!Array.isArray(value)) return [];
  const haystack = sourceText.toLowerCase();
  const emails = value
    .filter((item): item is string => typeof item === "string")
    .map((item) =>
      item
        .trim()
        .replace(/^mailto:/i, "")
        .toLowerCase()
    )
    .filter((email) => EMAIL_PATTERN.test(email) && haystack.includes(email));
  return [...new Set(emails)].slice(0, MAX_ATTENDEES);
}

function toDuration(value: unknown): number | null {
  const minutes = typeof value === "string" ? Number(value) : value;
  if (typeof minutes !== "number" || !Number.isFinite(minutes)) return null;
  const rounded = Math.round(minutes);
  return rounded >= 1 && rounded <= MAX_DURATION_MINUTES ? rounded : null;
}

function allDayEvent(
  start: LocalDateTime,
  endInput: unknown,
  base: Omit<CalendarEvent, "allDay" | "start" | "end" | "startUtc" | "endUtc" | "durationMinutes">
): CalendarEvent {
  const lastDay = parseLocalDateTime(endInput)?.local;
  const inclusiveEnd = lastDay && compareDates(lastDay, start) >= 0 ? lastDay : start;
  const days = Math.min(
    Math.round(compareDates(inclusiveEnd, start) / (24 * 60 * MINUTE_MS)) + 1,
    MAX_DURATION_MINUTES / (24 * 60)
  );
  return {
    ...base,
    allDay: true,
    start: formatLocalDate(start),
    end: formatLocalDate(addDays(start, days)),
    startUtc: null,
    endUtc: null,
    durationMinutes: days * 24 * 60,
  };
}

/**
 * Turns untrusted model output into a valid event in `timezone`. Returns null when there is no
 * usable start date.
 */
export function normalizeEvent(
  raw: unknown,
  timezone: string,
  sourceText: string
): CalendarEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const input = raw as Record<string, unknown>;
  if (input.hasDateOrTime === false) return null;

  const parsedStart = parseLocalDateTime(input.start);
  if (!parsedStart) return null;
  const start = { ...parsedStart.local, second: 0 };

  const base = {
    title: toText(input.title, MAX_TITLE_LENGTH) ?? "New event",
    timezone,
    location: toText(input.location, MAX_FIELD_LENGTH),
    description: toText(input.description, MAX_FIELD_LENGTH),
    attendees: normalizeAttendees(input.attendees, sourceText),
  };

  if (input.allDay === true || !parsedStart.hasTime) {
    return allDayEvent(start, input.end, base);
  }

  const startUtc = zonedTimeToUtc(start, timezone);
  let endUtc: Date | null = null;

  const parsedEnd = parseLocalDateTime(input.end);
  if (parsedEnd?.hasTime) {
    let candidate = zonedTimeToUtc({ ...parsedEnd.local, second: 0 }, timezone);
    // "10pm to 1am" often comes back with the start date on both ends.
    if (candidate <= startUtc) candidate = new Date(candidate.getTime() + 24 * 60 * MINUTE_MS);
    const minutes = (candidate.getTime() - startUtc.getTime()) / MINUTE_MS;
    if (minutes > 0 && minutes <= MAX_DURATION_MINUTES) endUtc = candidate;
  }

  if (!endUtc) {
    const minutes = toDuration(input.durationMinutes) ?? DEFAULT_DURATION_MINUTES;
    endUtc = new Date(startUtc.getTime() + minutes * MINUTE_MS);
  }

  return {
    ...base,
    allDay: false,
    start: formatLocalDateTime(start),
    end: formatLocalDateTime(zonedParts(endUtc, timezone)),
    startUtc: startUtc.toISOString(),
    endUtc: endUtc.toISOString(),
    durationMinutes: Math.round((endUtc.getTime() - startUtc.getTime()) / MINUTE_MS),
  };
}
