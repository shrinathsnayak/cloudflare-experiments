import { Hono } from "hono";
import type { Env } from "./types/env";
import metadataRoutes from "./routes/metadata";

const app = new Hono<{ Bindings: Env }>();

app.route("/", metadataRoutes);

app.get("/", (c) => {
  return c.json({
    name: "website-metadata-extractor",
    description: "Extract metadata from any webpage (title, description, Open Graph, canonical)",
    usage: "GET /metadata?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
