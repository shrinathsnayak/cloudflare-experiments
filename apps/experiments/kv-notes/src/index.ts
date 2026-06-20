import { Hono } from "hono";
import type { Env } from "./types/env";
import notesRoutes from "./routes/notes";

const app = new Hono<{ Bindings: Env }>();

app.route("/", notesRoutes);

app.get("/", (c) => {
  return c.json({
    name: "kv-notes",
    description: "Simple note storage with Workers KV",
    usage: "POST /notes with { id, content }; GET /notes?id=...",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
