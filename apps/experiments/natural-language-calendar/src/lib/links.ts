import type { CalendarEvent } from "../types/event";
import { formatDateValue, formatUtcStamp } from "./ics";

/** Encodes spaces as %20 (not "+"), which Outlook would otherwise show literally. */
function query(params: Record<string, string | null | undefined>): string {
  return Object.entries(params)
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
}

function isTimed(
  event: CalendarEvent
): event is CalendarEvent & { startUtc: string; endUtc: string } {
  return !event.allDay && Boolean(event.startUtc && event.endUtc);
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const dates = isTimed(event)
    ? `${formatUtcStamp(new Date(event.startUtc))}/${formatUtcStamp(new Date(event.endUtc))}`
    : `${formatDateValue(event.start)}/${formatDateValue(event.end)}`;
  return `https://calendar.google.com/calendar/render?${query({
    action: "TEMPLATE",
    text: event.title,
    dates,
    details: event.description,
    location: event.location,
    add: event.attendees.join(",") || null,
    ctz: event.timezone,
  })}`;
}

export function outlookUrl(event: CalendarEvent): string {
  const timed = isTimed(event);
  return `https://outlook.live.com/calendar/0/deeplink/compose?${query({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    startdt: timed ? event.startUtc.replace(/\.\d{3}Z$/, "Z") : event.start,
    enddt: timed ? event.endUtc.replace(/\.\d{3}Z$/, "Z") : event.end,
    allday: timed ? "false" : "true",
    body: event.description,
    location: event.location,
    to: event.attendees.join(",") || null,
  })}`;
}
