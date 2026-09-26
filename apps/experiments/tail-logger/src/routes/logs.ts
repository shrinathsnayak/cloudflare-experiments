import { Hono } from "hono";
import type { Env } from "../types/env";
import { clearRecent, readRecent } from "../lib/logs";
import { jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/logs", async (c) => {
  const events = await readRecent(c.env.TAIL_LOGS);
  return jsonSuccess(c, { events, count: events.length });
});

app.delete("/logs", async (c) => {
  await clearRecent(c.env.TAIL_LOGS);
  return jsonSuccess(c, { cleared: true });
});

export default app;
