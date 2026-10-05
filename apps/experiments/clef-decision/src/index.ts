import { Hono } from "hono";
import type { Env } from "./types/env";
import decisionRoutes from "./routes/decision";

const app = new Hono<{ Bindings: Env }>();

app.route("/", decisionRoutes);

app.get("/", (c) => {
  return c.json({
    name: "clef-decision",
    description: "Workers AI decision probabilities with Clef or Clef-Flash models",
    usage: 'POST /decision with { "state": "...", "questions": [...] }',
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
