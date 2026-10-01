export const EVENT_JSON_SCHEMA = {
  type: "object",
  properties: {
    hasDateOrTime: {
      type: "boolean",
      description: "true only if the text states a date, weekday, relative day, or time",
    },
    title: { type: "string", description: "Short event title" },
    start: {
      type: "string",
      description: "Local start as YYYY-MM-DDTHH:mm (timed) or YYYY-MM-DD (all-day), no offset",
    },
    end: {
      type: ["string", "null"],
      description: "Local end in the same format as start, or null if not stated",
    },
    durationMinutes: { type: ["number", "null"] },
    location: { type: ["string", "null"] },
    description: { type: ["string", "null"] },
    allDay: { type: "boolean" },
    attendees: {
      type: "array",
      items: { type: "string" },
      description: "Email addresses mentioned in the text",
    },
  },
  required: [
    "hasDateOrTime",
    "title",
    "start",
    "end",
    "durationMinutes",
    "location",
    "description",
    "allDay",
    "attendees",
  ],
} as const;
