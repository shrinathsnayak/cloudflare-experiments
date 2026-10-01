import { ICS_PRODID } from "../constants/defaults";
import type { CalendarEvent } from "../types/event";

const CRLF = "\r\n";
const MAX_LINE_OCTETS = 75;
const encoder = new TextEncoder();

/** Escapes a TEXT value per RFC 5545 §3.3.11. */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/**
 * Folds a content line at 75 octets (RFC 5545 §3.1). Continuation lines start with a space, which
 * counts toward their 75 octets; multi-byte UTF-8 characters are never split.
 */
export function foldLine(line: string): string {
  const lines: string[] = [];
  let current = "";
  let octets = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    const limit = lines.length === 0 ? MAX_LINE_OCTETS : MAX_LINE_OCTETS - 1;
    if (octets + size > limit) {
      lines.push(current);
      current = "";
      octets = 0;
    }
    current += char;
    octets += size;
  }
  lines.push(current);
  return lines.join(`${CRLF} `);
}

/** 2026-10-06T13:00:00.000Z → 20261006T130000Z */
export function formatUtcStamp(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

/** 2026-10-06 → 20261006 */
export function formatDateValue(isoDate: string): string {
  return isoDate.slice(0, 10).replace(/-/g, "");
}

/**
 * Builds a single-event VCALENDAR. Timed events use UTC (`DTSTART:...Z`) instead of a TZID, so no
 * VTIMEZONE block is needed and every client shows the correct instant.
 */
export function buildIcs(event: CalendarEvent, options: { uid: string; dtstamp: Date }): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${ICS_PRODID}`,
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${options.uid}`,
    `DTSTAMP:${formatUtcStamp(options.dtstamp)}`,
  ];

  if (event.allDay || !event.startUtc || !event.endUtc) {
    lines.push(`DTSTART;VALUE=DATE:${formatDateValue(event.start)}`);
    lines.push(`DTEND;VALUE=DATE:${formatDateValue(event.end)}`);
  } else {
    lines.push(`DTSTART:${formatUtcStamp(new Date(event.startUtc))}`);
    lines.push(`DTEND:${formatUtcStamp(new Date(event.endUtc))}`);
  }

  lines.push(`SUMMARY:${escapeText(event.title)}`);
  if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
  if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  for (const email of event.attendees) {
    lines.push(`ATTENDEE;RSVP=TRUE:mailto:${email}`);
  }
  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.map(foldLine).join(CRLF) + CRLF;
}
