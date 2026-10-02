import { describe, it, expect } from "vitest";
import { normalizeAttendees, normalizeEvent } from "../../src/lib/normalize";
import { buildSystemPrompt, parseModelJson } from "../../src/lib/extract";
import { googleCalendarUrl, outlookUrl } from "../../src/lib/links";

const TZ = "America/New_York";
const TEXT = "Lunch with sam@example.com next Tue 1pm at Blue Bottle";

describe("normalizeEvent", () => {
  it("defaults timed events to 60 minutes and converts to UTC", () => {
    const event = normalizeEvent(
      { title: "Lunch with Sam", start: "2026-10-06T13:00", allDay: false },
      TZ,
      TEXT
    );
    expect(event).toMatchObject({
      title: "Lunch with Sam",
      allDay: false,
      timezone: TZ,
      start: "2026-10-06T13:00:00",
      end: "2026-10-06T14:00:00",
      startUtc: "2026-10-06T17:00:00.000Z",
      endUtc: "2026-10-06T18:00:00.000Z",
      durationMinutes: 60,
    });
  });

  it("uses an explicit end, or durationMinutes when end is missing", () => {
    expect(
      normalizeEvent({ start: "2026-10-06T09:00", end: "2026-10-06T10:30" }, TZ, TEXT)
        ?.durationMinutes
    ).toBe(90);
    expect(
      normalizeEvent({ start: "2026-10-06T09:00", end: null, durationMinutes: 45 }, TZ, TEXT)?.end
    ).toBe("2026-10-06T09:45:00");
  });

  it("rolls an end before the start over to the next day", () => {
    const event = normalizeEvent({ start: "2026-10-06T22:00", end: "2026-10-06T01:00" }, TZ, TEXT);
    expect(event?.end).toBe("2026-10-07T01:00:00");
    expect(event?.durationMinutes).toBe(180);
  });

  it("builds all-day events with an exclusive end date", () => {
    const single = normalizeEvent({ title: "Offsite", start: "2026-10-09", allDay: true }, TZ, "");
    expect(single).toMatchObject({
      allDay: true,
      start: "2026-10-09",
      end: "2026-10-10",
      startUtc: null,
      durationMinutes: 1440,
    });
    const multi = normalizeEvent({ start: "2026-10-09", end: "2026-10-11", allDay: true }, TZ, "");
    expect(multi?.end).toBe("2026-10-12");
  });

  it("returns null without a usable start and defaults a missing title", () => {
    expect(normalizeEvent({ title: "Lunch", start: "next tuesday" }, TZ, TEXT)).toBeNull();
    expect(normalizeEvent(null, TZ, TEXT)).toBeNull();
    expect(
      normalizeEvent({ hasDateOrTime: false, start: "2026-10-01", allDay: true }, TZ, "x")
    ).toBeNull();
    expect(normalizeEvent({ start: "2026-10-06T13:00" }, TZ, TEXT)?.title).toBe("New event");
  });
});

describe("normalizeAttendees", () => {
  it("keeps only valid emails present in the source text", () => {
    expect(
      normalizeAttendees(
        ["Sam@Example.com", "mailto:sam@example.com", "invented@example.com", "Sam", 3],
        TEXT
      )
    ).toEqual(["sam@example.com"]);
  });
});

describe("parseModelJson", () => {
  it("handles object and string responses, and returns null for junk", () => {
    expect(parseModelJson({ response: { title: "A" } })).toEqual({ title: "A" });
    expect(parseModelJson({ response: '{"title":"B"}' })).toEqual({ title: "B" });
    expect(parseModelJson({ response: "not json" })).toBeNull();
    expect(parseModelJson({})).toBeNull();
  });
});

describe("buildSystemPrompt", () => {
  it("includes the local date, weekday, timezone, and upcoming dates", () => {
    const prompt = buildSystemPrompt(TZ, new Date("2026-10-02T02:00:00Z"));
    expect(prompt).toContain("America/New_York");
    expect(prompt).toContain("Thursday 2026-10-01 22:00");
    expect(prompt).toContain("Thursday 2026-10-01 (today)");
    expect(prompt).toContain("Tuesday 2026-10-06");
  });
});

describe("calendar links", () => {
  const event = normalizeEvent(
    {
      title: "Lunch with Sam",
      start: "2026-10-06T13:00",
      location: "Blue Bottle",
      description: "Catch up & plan",
      attendees: ["sam@example.com"],
    },
    TZ,
    TEXT
  )!;

  it("builds a Google Calendar template URL", () => {
    const url = new URL(googleCalendarUrl(event));
    expect(url.origin + url.pathname).toBe("https://calendar.google.com/calendar/render");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("text")).toBe("Lunch with Sam");
    expect(url.searchParams.get("dates")).toBe("20261006T170000Z/20261006T180000Z");
    expect(url.searchParams.get("details")).toBe("Catch up & plan");
    expect(url.searchParams.get("location")).toBe("Blue Bottle");
    expect(url.searchParams.get("add")).toBe("sam@example.com");
    expect(url.searchParams.get("ctz")).toBe(TZ);
    expect(url.search).not.toContain("+");
  });

  it("builds an Outlook compose URL", () => {
    const url = new URL(outlookUrl(event));
    expect(url.origin + url.pathname).toBe("https://outlook.live.com/calendar/0/deeplink/compose");
    expect(url.searchParams.get("subject")).toBe("Lunch with Sam");
    expect(url.searchParams.get("startdt")).toBe("2026-10-06T17:00:00Z");
    expect(url.searchParams.get("enddt")).toBe("2026-10-06T18:00:00Z");
    expect(url.searchParams.get("allday")).toBe("false");
    expect(url.searchParams.get("to")).toBe("sam@example.com");
  });

  it("uses date-only values for all-day events", () => {
    const allDay = normalizeEvent({ title: "Offsite", start: "2026-10-09" }, TZ, "")!;
    expect(new URL(googleCalendarUrl(allDay)).searchParams.get("dates")).toBe("20261009/20261010");
    const outlook = new URL(outlookUrl(allDay)).searchParams;
    expect(outlook.get("startdt")).toBe("2026-10-09");
    expect(outlook.get("allday")).toBe("true");
  });
});
