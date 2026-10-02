import { Hono } from "hono";
import type { Env } from "./types/env";
import eventRoutes from "./routes/event";

const app = new Hono<{ Bindings: Env }>();

app.route("/", eventRoutes);

app.get("/", (c) => {
  return c.json({
    name: "natural-language-calendar",
    description:
      "Turn plain English into a calendar invite (.ics, Google, Outlook) with Workers AI JSON mode",
    usage:
      'POST /event {"text":"Lunch with sam@example.com next Tue 1pm at Blue Bottle"} or GET /event.ics?text=...&timezone=America/New_York',
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
