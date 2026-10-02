import { describe, it, expect, vi } from "vitest";
import eventRoutes from "../../src/routes/event";
import type { Env } from "../../src/types/env";
import type { EventResponse } from "../../src/types/event";

const MODEL_EVENT = {
  title: "Lunch with Sam",
  start: "2026-10-06T13:00",
  end: null,
  durationMinutes: null,
  location: "Blue Bottle",
  description: null,
  allDay: false,
  attendees: ["sam@example.com"],
};

function createEnv(run = vi.fn().mockResolvedValue({ response: MODEL_EVENT })) {
  return { env: { AI: { run } } as unknown as Env, run };
}

function postEvent(body: unknown, env: Env) {
  return eventRoutes.fetch(
    new Request("http://localhost/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
    env
  );
}

const TEXT = "Lunch with sam@example.com next Tue 1pm at Blue Bottle";

describe("POST /event", () => {
  it("returns the event, ICS, and calendar links", async () => {
    const { env, run } = createEnv();
    const res = await postEvent(
      { text: TEXT, timezone: "America/New_York", now: "2026-10-01T15:00:00Z" },
      env
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as EventResponse;
    expect(body.event.startUtc).toBe("2026-10-06T17:00:00.000Z");
    expect(body.event.attendees).toEqual(["sam@example.com"]);
    expect(body.ics).toContain("DTSTART:20261006T170000Z\r\n");
    expect(body.googleCalendarUrl).toContain("calendar.google.com");
    expect(body.outlookUrl).toContain("outlook.live.com");

    const [model, input] = run.mock.calls[0] as [
      string,
      { messages: { content: string }[]; response_format: { type: string } },
    ];
    expect(model).toBe("@cf/meta/llama-3.3-70b-instruct-fp8-fast");
    expect(input.response_format.type).toBe("json_schema");
    expect(input.messages[0].content).toContain("Thursday 2026-10-01");
    expect(input.messages[1].content).toBe(TEXT);
  });

  it("rejects missing or too-long text", async () => {
    const { env, run } = createEnv();
    for (const text of [undefined, "", "x".repeat(501)]) {
      const res = await postEvent({ text }, env);
      expect(res.status).toBe(400);
      expect(((await res.json()) as { code: string }).code).toBe("INVALID_TEXT");
    }
    expect(run).not.toHaveBeenCalled();
  });

  it("rejects invalid timezone, now, and JSON", async () => {
    const { env } = createEnv();
    const tz = await postEvent({ text: TEXT, timezone: "Moon/Base" }, env);
    expect(((await tz.json()) as { code: string }).code).toBe("INVALID_TIMEZONE");
    const now = await postEvent({ text: TEXT, now: "soon" }, env);
    expect(((await now.json()) as { code: string }).code).toBe("INVALID_NOW");
    const json = await postEvent("{not json", env);
    expect(((await json.json()) as { code: string }).code).toBe("INVALID_BODY");
  });

  it("returns PARSE_ERROR when the model output has no usable date", async () => {
    const { env } = createEnv(
      vi.fn().mockResolvedValue({ response: { title: "Lunch", start: "" } })
    );
    const res = await postEvent({ text: "something vague" }, env);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string; error: string };
    expect(body.code).toBe("PARSE_ERROR");
    expect(body.error).toContain("rephras");
  });

  it("returns AI_ERROR when the model call fails", async () => {
    const { env } = createEnv(vi.fn().mockRejectedValue(new Error("capacity")));
    const res = await postEvent({ text: TEXT }, env);
    expect(res.status).toBe(502);
    expect(((await res.json()) as { code: string }).code).toBe("AI_ERROR");
  });
});

describe("GET /event.ics", () => {
  it("returns a downloadable text/calendar file", async () => {
    const { env } = createEnv();
    const params = new URLSearchParams({ text: TEXT, timezone: "America/New_York" });
    const res = await eventRoutes.fetch(new Request(`http://localhost/event.ics?${params}`), env);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/calendar; charset=utf-8");
    expect(res.headers.get("Content-Disposition")).toBe("attachment; filename=event.ics");
    const ics = await res.text();
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("SUMMARY:Lunch with Sam\r\n");
  });

  it("returns JSON errors for invalid input", async () => {
    const { env } = createEnv();
    const res = await eventRoutes.fetch(new Request("http://localhost/event.ics"), env);
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe("INVALID_TEXT");
  });
});
