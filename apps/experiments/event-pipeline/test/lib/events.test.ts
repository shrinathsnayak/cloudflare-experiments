import { describe, it, expect } from "vitest";
import { parseEventsBody } from "../../src/lib/events";

describe("parseEventsBody", () => {
  it("accepts a single object", () => {
    const result = parseEventsBody({ type: "click" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.events).toHaveLength(1);
  });

  it("accepts an array", () => {
    const result = parseEventsBody([{ a: 1 }, { b: 2 }]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.events).toHaveLength(2);
  });

  it("accepts { events: [...] }", () => {
    const result = parseEventsBody({ events: [{ type: "x" }] });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.events[0]).toEqual({ type: "x" });
  });

  it("rejects more than 100 events", () => {
    const events = Array.from({ length: 101 }, (_, i) => ({ i }));
    const result = parseEventsBody(events);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("TOO_MANY_EVENTS");
  });

  it("rejects non-object items", () => {
    const result = parseEventsBody([1, 2]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INVALID_BODY");
  });

  it("rejects empty array", () => {
    const result = parseEventsBody([]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INVALID_BODY");
  });
});
