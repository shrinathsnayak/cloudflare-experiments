/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /event.ics?text=Lunch next Tue 1pm&timezone=America/New_York
 */
import { createEvent } from "../src/lib/event";
import { resolveTimeZone, validateText } from "../src/lib/input";

export default {
  async fetch(request: Request, env: { AI: Ai }): Promise<Response> {
    const params = new URL(request.url).searchParams;
    const text = validateText(params.get("text"));
    const timezone = resolveTimeZone(params.get("timezone") ?? undefined, request.cf?.timezone);
    if (!text || !timezone) {
      return Response.json(
        { error: "Invalid text or timezone", code: "INVALID_TEXT" },
        { status: 400 }
      );
    }

    const result = await createEvent(env.AI, { text, timezone, now: new Date() });
    if (!result.ok)
      return Response.json({ error: result.message, code: result.code }, { status: 400 });

    return new Response(result.data.ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": "attachment; filename=event.ics",
      },
    });
  },
};
