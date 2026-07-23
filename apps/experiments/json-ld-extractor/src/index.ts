import { Hono } from "hono";
import type { Env } from "./types/env";
import extractRoutes from "./routes/extract";

const app = new Hono<{ Bindings: Env }>();

app.route("/", extractRoutes);

app.get("/", (c) => {
  return c.json({
    name: "json-ld-extractor",
    description: "Extract Schema.org JSON-LD structured data from any webpage at the edge",
    usage: "GET /extract?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
