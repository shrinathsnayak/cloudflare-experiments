import { Hono } from "hono";
import type { Env } from "./types/env";
import filesRoutes from "./routes/files";

const app = new Hono<{ Bindings: Env }>();

app.route("/", filesRoutes);

app.get("/", (c) => {
  return c.json({
    name: "artifact-workspace",
    description: "Store versioned filesystem artifacts (Artifacts-style workspace on R2)",
    usage: "PUT/GET/DELETE /files?path=...; GET /files/list?prefix=",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
