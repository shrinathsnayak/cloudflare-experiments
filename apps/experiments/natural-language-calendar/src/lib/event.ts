import { ICS_UID_DOMAIN } from "../constants/defaults";
import type { EventResponse } from "../types/event";
import { parseModelJson, runEventModel } from "./extract";
import { normalizeEvent } from "./normalize";
import { buildIcs } from "./ics";
import { googleCalendarUrl, outlookUrl } from "./links";

export type CreateEventResult =
  | { ok: true; data: EventResponse }
  | { ok: false; code: "AI_ERROR" | "PARSE_ERROR"; message: string };

/** Text → model → normalized event → ICS + calendar links. */
export async function createEvent(
  ai: Ai,
  input: { text: string; timezone: string; now: Date }
): Promise<CreateEventResult> {
  let output: unknown;
  try {
    output = await runEventModel(ai, input.text, input.timezone, input.now);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Event extraction failed";
    return { ok: false, code: "AI_ERROR", message };
  }

  const event = normalizeEvent(parseModelJson(output), input.timezone, input.text);
  if (!event) {
    return {
      ok: false,
      code: "PARSE_ERROR",
      message:
        "Couldn't find a date in that text. Try rephrasing, e.g. 'Lunch with Sam next Tuesday at 1pm'",
    };
  }

  const ics = buildIcs(event, {
    uid: `${crypto.randomUUID()}@${ICS_UID_DOMAIN}`,
    dtstamp: new Date(),
  });
  return {
    ok: true,
    data: {
      event,
      ics,
      googleCalendarUrl: googleCalendarUrl(event),
      outlookUrl: outlookUrl(event),
    },
  };
}
