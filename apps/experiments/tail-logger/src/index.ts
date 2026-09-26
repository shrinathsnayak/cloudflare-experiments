import { Hono } from "hono";
import type { Env } from "./types/env";
import logsRoutes from "./routes/logs";
import { appendTailEvents } from "./lib/logs";

const app = new Hono<{ Bindings: Env }>();

app.route("/", logsRoutes);

app.get("/", (c) => {
  return c.json({
    name: "tail-logger",
    description: "Tail Worker that stores recent traces from another Worker in KV",
    usage: "GET /logs; DELETE /logs — configure producers with tail_consumers",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

async function handleTail(events: TraceItem[], env: Env): Promise<void> {
  await appendTailEvents(env.TAIL_LOGS, events);
}

export default {
  fetch: app.fetch,
  tail: handleTail,
};
