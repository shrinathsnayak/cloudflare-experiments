# Natural Language Calendar

Turn plain English like "Lunch with sam@example.com next Tue 1pm at Blue Bottle" into a calendar invite. **Workers AI** JSON mode (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`) extracts the event, code validates it, and the Worker returns an RFC 5545 `.ics` file plus Google Calendar and Outlook links.

## API

### `POST /event`

```json
{
  "text": "Lunch with sam@example.com next Tue 1pm at Blue Bottle",
  "timezone": "America/New_York",
  "now": "2026-10-01T15:00:00Z"
}
```

| Field      | Required | Description                                                          |
| ---------- | -------- | -------------------------------------------------------------------- |
| `text`     | Yes      | Event description, max 500 characters                                |
| `timezone` | No       | IANA zone; defaults to the visitor's `request.cf.timezone`, then UTC |
| `now`      | No       | ISO 8601 reference time for resolving "tomorrow" etc. (tests)        |

**Response**

```json
{
  "event": {
    "title": "Lunch",
    "allDay": false,
    "timezone": "America/New_York",
    "start": "2026-10-06T13:00:00",
    "end": "2026-10-06T14:00:00",
    "startUtc": "2026-10-06T17:00:00.000Z",
    "endUtc": "2026-10-06T18:00:00.000Z",
    "durationMinutes": 60,
    "location": "Blue Bottle",
    "description": null,
    "attendees": ["sam@example.com"]
  },
  "ics": "BEGIN:VCALENDAR\r\nVERSION:2.0\r\n...",
  "googleCalendarUrl": "https://calendar.google.com/calendar/render?action=TEMPLATE&...",
  "outlookUrl": "https://outlook.live.com/calendar/0/deeplink/compose?..."
}
```

### `GET /event.ics`

Same inputs as query params (`text`, `timezone`, `now`). Returns `text/calendar` with `Content-Disposition: attachment; filename=event.ics`, so a link opens directly in Calendar apps.

```bash
curl -OJ "http://localhost:8787/event.ics?text=Team%20offsite%20Oct%2012-13%20in%20Lisbon&timezone=Europe/Lisbon"
```

**Errors**

- `400` - `INVALID_TEXT`, `INVALID_TIMEZONE`, `INVALID_NOW`, `INVALID_BODY`, `PARSE_ERROR` (no usable date in the text; rephrase)
- `502` - `AI_ERROR`

## How it works

- The prompt includes the current local date, weekday, and a 14-day table of upcoming dates so "next Tue" resolves correctly.
- The model returns local wall time; `src/lib/timezone.ts` converts it to UTC with `Intl.DateTimeFormat` (DST-safe).
- Defaults: 60-minute duration; an end before the start rolls to the next day; all-day events get an exclusive end date.
- Attendees are kept only if the email literally appears in the text.
- `src/lib/ics.ts` writes CRLF line endings, folds lines at 75 octets, escapes `\ ; ,` and newlines, and adds `UID` and `DTSTAMP`. Timed events are written in **UTC** (`DTSTART:20261006T170000Z`) instead of `TZID`, so no `VTIMEZONE` block is needed and every client shows the correct instant. All-day events use `VALUE=DATE`.

## Run locally

```bash
cd apps/experiments/natural-language-calendar
npm install
npm run dev
```

Requires a Cloudflare account with Workers AI enabled (the `AI` binding runs remotely in `wrangler dev`).

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/natural-language-calendar)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers (`request.cf.timezone`)
- Workers AI JSON mode (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`)
