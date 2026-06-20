import { Hono } from "hono";
import type { Env } from "./types/env";
import pdfRoutes from "./routes/pdf";

const app = new Hono<{ Bindings: Env }>();

app.route("/", pdfRoutes);

app.get("/", (c) => {
  return c.json({
    name: "pdf-api",
    description: "Generate PDF documents from any webpage using Browser Rendering",
    usage: "GET /pdf?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
