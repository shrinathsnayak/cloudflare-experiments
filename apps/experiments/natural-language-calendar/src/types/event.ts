/** Wall-clock date/time in some time zone (month is 1-based). */
export interface LocalDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export interface EventRequestBody {
  text?: unknown;
  timezone?: unknown;
  now?: unknown;
}

export interface CalendarEvent {
  title: string;
  allDay: boolean;
  /** IANA time zone the local times are in */
  timezone: string;
  /** Local wall time: YYYY-MM-DDTHH:mm:ss, or YYYY-MM-DD for all-day events */
  start: string;
  /** Local end; for all-day events this is the exclusive end date */
  end: string;
  /** UTC instants (ISO 8601); null for all-day events */
  startUtc: string | null;
  endUtc: string | null;
  durationMinutes: number;
  location: string | null;
  description: string | null;
  attendees: string[];
}

export interface EventResponse {
  event: CalendarEvent;
  ics: string;
  googleCalendarUrl: string;
  outlookUrl: string;
}
