import { Hono } from "hono";
import type { Env } from "./types/env";
import eventsRoutes from "./routes/events";

const app = new Hono<{ Bindings: Env }>();

app.route("/", eventsRoutes);

app.get("/", (c) => {
  return c.json({
    name: "event-pipeline",
    description: "Ingest events into Cloudflare Pipelines (stream to R2/Iceberg)",
    usage: "POST /events with a JSON object, array, or { events: [...] }; GET /events/sample",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
