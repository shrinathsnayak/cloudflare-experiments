import { AI_MODEL, PROMPT_CALENDAR_DAYS } from "../constants/defaults";
import { EVENT_JSON_SCHEMA } from "../constants/schema";
import { addDays, formatLocalDate, zonedParts } from "./timezone";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * LLMs are unreliable at weekday arithmetic, so the prompt lists the next two weeks of dates with
 * their weekdays for resolving phrases like "next Tue".
 */
export function buildSystemPrompt(timezone: string, now: Date): string {
  const local = zonedParts(now, timezone);
  const today = formatLocalDate(local);
  const time = `${String(local.hour).padStart(2, "0")}:${String(local.minute).padStart(2, "0")}`;
  const upcoming = Array.from({ length: PROMPT_CALENDAR_DAYS }, (_, i) => {
    const day = addDays(local, i);
    const weekday = WEEKDAYS[new Date(Date.UTC(day.year, day.month - 1, day.day)).getUTCDay()];
    return `${weekday} ${formatLocalDate(day)}${i === 0 ? " (today)" : ""}`;
  }).join("\n");

  return [
    "You convert a natural-language event description into a calendar event JSON object.",
    `The user's time zone is ${timezone}. It is currently ${local.weekday} ${today} ${time} there.`,
    "Upcoming dates:",
    upcoming,
    "Rules:",
    "- hasDateOrTime is false when the text gives no date, day, or time at all; do not default to today.",
    "- start and end are local wall times in the user's time zone formatted YYYY-MM-DDTHH:mm, with no offset or Z.",
    "- Resolve relative dates (today, tomorrow, next Tuesday, in 3 days) using the dates above. Never pick a date in the past.",
    "- If no time of day is given, set allDay to true and use YYYY-MM-DD for start (and for end on multi-day events, as the last day).",
    "- If an end time is not stated, set end to null and durationMinutes to the stated duration or null.",
    "- attendees: only email addresses that appear in the text. Do not invent addresses.",
    "- title: short and descriptive, without the date or time.",
  ].join("\n");
}

export async function runEventModel(
  ai: Ai,
  text: string,
  timezone: string,
  now: Date
): Promise<unknown> {
  return ai.run(AI_MODEL, {
    messages: [
      { role: "system", content: buildSystemPrompt(timezone, now) },
      { role: "user", content: text },
    ],
    response_format: { type: "json_schema", json_schema: EVENT_JSON_SCHEMA },
    temperature: 0,
    max_tokens: 512,
  });
}

/** JSON mode may return `response` as a parsed object or a JSON string; null if unusable. */
export function parseModelJson(output: unknown): unknown {
  const response =
    output && typeof output === "object" ? (output as { response?: unknown }).response : output;
  if (response && typeof response === "object") return response;
  if (typeof response !== "string") return null;
  try {
    return JSON.parse(
      response
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```$/, "")
        .trim()
    );
  } catch {
    return null;
  }
}
