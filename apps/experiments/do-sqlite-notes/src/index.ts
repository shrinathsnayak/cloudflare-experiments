import { Hono } from "hono";
import type { Env } from "./types/env";
import notesRoutes from "./routes/notes";

const app = new Hono<{ Bindings: Env }>();

app.route("/", notesRoutes);

app.get("/", (c) => {
  return c.json({
    name: "do-sqlite-notes",
    description: "Per-user notes stored in SQLite-backed Durable Objects via sql.exec",
    usage: {
      createOrUpdate: "POST /notes with { userId, id, content }",
      getOne: "GET /notes?userId=&id=",
      list: "GET /notes?userId=",
      delete: "DELETE /notes?userId=&id=",
    },
    cloudflareFeatures: ["Durable Objects", "SQLite Storage"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export { NotesDO } from "./notes-do";
export default {
  fetch: app.fetch,
};
