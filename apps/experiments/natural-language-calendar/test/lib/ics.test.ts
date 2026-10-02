import { describe, it, expect } from "vitest";
import { buildIcs, escapeText, foldLine, formatUtcStamp } from "../../src/lib/ics";
import type { CalendarEvent } from "../../src/types/event";

const octets = (s: string) => new TextEncoder().encode(s).length;

const timedEvent: CalendarEvent = {
  title: "Lunch, with Sam; maybe",
  allDay: false,
  timezone: "America/New_York",
  start: "2026-10-06T13:00:00",
  end: "2026-10-06T14:00:00",
  startUtc: "2026-10-06T17:00:00.000Z",
  endUtc: "2026-10-06T18:00:00.000Z",
  durationMinutes: 60,
  location: "Blue Bottle\nHayes Valley",
  description: null,
  attendees: ["sam@example.com"],
};

describe("escapeText", () => {
  it("escapes backslash, semicolon, comma, and newlines", () => {
    expect(escapeText("a\\b;c,d\ne\r\nf")).toBe("a\\\\b\\;c\\,d\\ne\\nf");
  });
});

describe("foldLine", () => {
  it("leaves short lines alone", () => {
    expect(foldLine("SUMMARY:Hi")).toBe("SUMMARY:Hi");
  });

  it("folds at 75 octets with a leading space on continuation lines", () => {
    const line = `DESCRIPTION:${"x".repeat(200)}`;
    const folded = foldLine(line);
    const parts = folded.split("\r\n");
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.every((part) => octets(part) <= 75)).toBe(true);
    expect(octets(parts[0])).toBe(75);
    expect(parts.slice(1).every((part) => part.startsWith(" "))).toBe(true);
    expect(parts.map((p, i) => (i === 0 ? p : p.slice(1))).join("")).toBe(line);
  });

  it("never splits a multi-byte character", () => {
    const line = `SUMMARY:${"日本".repeat(40)}`;
    const parts = foldLine(line).split("\r\n");
    expect(parts.every((part) => octets(part) <= 75)).toBe(true);
    expect(parts.map((p, i) => (i === 0 ? p : p.slice(1))).join("")).toBe(line);
  });
});

describe("buildIcs", () => {
  const dtstamp = new Date("2026-10-01T12:00:00Z");

  it("builds a timed event in UTC with CRLF line endings", () => {
    const ics = buildIcs(timedEvent, { uid: "abc@test", dtstamp });
    expect(ics.endsWith("\r\n")).toBe(true);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
    const lines = ics.split("\r\n");
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines).toContain("VERSION:2.0");
    expect(lines).toContain("UID:abc@test");
    expect(lines).toContain("DTSTAMP:20261001T120000Z");
    expect(lines).toContain("DTSTART:20261006T170000Z");
    expect(lines).toContain("DTEND:20261006T180000Z");
    expect(lines).toContain("SUMMARY:Lunch\\, with Sam\\; maybe");
    expect(lines).toContain("LOCATION:Blue Bottle\\nHayes Valley");
    expect(lines).toContain("ATTENDEE;RSVP=TRUE:mailto:sam@example.com");
    expect(lines.some((line) => line.startsWith("DESCRIPTION"))).toBe(false);
  });

  it("uses VALUE=DATE for all-day events", () => {
    const ics = buildIcs(
      {
        ...timedEvent,
        allDay: true,
        start: "2026-10-09",
        end: "2026-10-11",
        startUtc: null,
        endUtc: null,
        durationMinutes: 2880,
      },
      { uid: "x@test", dtstamp }
    );
    expect(ics).toContain("DTSTART;VALUE=DATE:20261009\r\n");
    expect(ics).toContain("DTEND;VALUE=DATE:20261011\r\n");
  });
});

describe("formatUtcStamp", () => {
  it("formats as basic UTC date-time", () => {
    expect(formatUtcStamp(new Date("2026-01-02T03:04:05.678Z"))).toBe("20260102T030405Z");
  });
});
