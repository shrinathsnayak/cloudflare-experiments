import { describe, it, expect } from "vitest";
import {
  canonicalTimeZone,
  parseLocalDateTime,
  zonedParts,
  zonedTimeToUtc,
} from "../../src/lib/timezone";
import { resolveNow, resolveTimeZone, validateText } from "../../src/lib/input";

const at = (year: number, month: number, day: number, hour = 0, minute = 0) => ({
  year,
  month,
  day,
  hour,
  minute,
  second: 0,
});

describe("zonedTimeToUtc", () => {
  it("converts New York wall time in summer (EDT) and winter (EST)", () => {
    expect(zonedTimeToUtc(at(2026, 7, 1, 13), "America/New_York").toISOString()).toBe(
      "2026-07-01T17:00:00.000Z"
    );
    expect(zonedTimeToUtc(at(2026, 1, 15, 13), "America/New_York").toISOString()).toBe(
      "2026-01-15T18:00:00.000Z"
    );
  });

  it("handles half-hour offsets and UTC", () => {
    expect(zonedTimeToUtc(at(2026, 10, 1, 9, 30), "Asia/Kolkata").toISOString()).toBe(
      "2026-10-01T04:00:00.000Z"
    );
    expect(zonedTimeToUtc(at(2026, 10, 1, 9), "UTC").toISOString()).toBe(
      "2026-10-01T09:00:00.000Z"
    );
  });

  it("is correct right after a DST transition", () => {
    // US DST starts 2026-03-08 at 02:00 local.
    expect(zonedTimeToUtc(at(2026, 3, 8, 3), "America/New_York").toISOString()).toBe(
      "2026-03-08T07:00:00.000Z"
    );
    expect(zonedTimeToUtc(at(2026, 3, 8, 1), "America/New_York").toISOString()).toBe(
      "2026-03-08T06:00:00.000Z"
    );
  });

  it("round-trips with zonedParts", () => {
    const utc = zonedTimeToUtc(at(2026, 12, 31, 23, 45), "Australia/Sydney");
    const parts = zonedParts(utc, "Australia/Sydney");
    expect([parts.year, parts.month, parts.day, parts.hour, parts.minute]).toEqual([
      2026, 12, 31, 23, 45,
    ]);
  });
});

describe("canonicalTimeZone", () => {
  it("canonicalizes valid zones and rejects junk", () => {
    expect(canonicalTimeZone("america/new_york")).toBe("America/New_York");
    expect(canonicalTimeZone("Asia/Kolkata")).toBe("Asia/Kolkata");
    expect(canonicalTimeZone("Mars/Olympus")).toBeNull();
    expect(canonicalTimeZone("")).toBeNull();
  });
});

describe("parseLocalDateTime", () => {
  it("parses dates and date-times, ignoring offsets", () => {
    expect(parseLocalDateTime("2026-10-06")).toEqual({ local: at(2026, 10, 6), hasTime: false });
    expect(parseLocalDateTime("2026-10-06T13:30")).toEqual({
      local: at(2026, 10, 6, 13, 30),
      hasTime: true,
    });
    expect(parseLocalDateTime("2026-10-06T13:30:00Z")?.local.hour).toBe(13);
  });

  it("rejects impossible dates", () => {
    expect(parseLocalDateTime("2026-02-30")).toBeNull();
    expect(parseLocalDateTime("2026-10-06T25:00")).toBeNull();
    expect(parseLocalDateTime("next tuesday")).toBeNull();
  });
});

describe("input helpers", () => {
  it("validates text length", () => {
    expect(validateText("  lunch tomorrow ")).toBe("lunch tomorrow");
    expect(validateText("")).toBeNull();
    expect(validateText("x".repeat(501))).toBeNull();
    expect(validateText(42)).toBeNull();
  });

  it("resolves timezone from explicit value, then cf, then UTC", () => {
    expect(resolveTimeZone("Europe/Paris", "Asia/Tokyo")).toBe("Europe/Paris");
    expect(resolveTimeZone(undefined, "Asia/Tokyo")).toBe("Asia/Tokyo");
    expect(resolveTimeZone(undefined, undefined)).toBe("UTC");
    expect(resolveTimeZone("Not/AZone", "Asia/Tokyo")).toBeNull();
  });

  it("resolves now", () => {
    expect(resolveNow("2026-10-01T10:00:00Z")?.toISOString()).toBe("2026-10-01T10:00:00.000Z");
    expect(resolveNow(undefined)).toBeInstanceOf(Date);
    expect(resolveNow("yesterday-ish")).toBeNull();
  });
});
