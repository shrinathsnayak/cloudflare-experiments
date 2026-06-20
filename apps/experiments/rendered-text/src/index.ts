import { Hono } from "hono";
import type { Env } from "./types/env";
import textRoutes from "./routes/text";

const app = new Hono<{ Bindings: Env }>();

app.route("/", textRoutes);

app.get("/", (c) => {
  return c.json({
    name: "rendered-text",
    description:
      "Extract JavaScript-rendered visible text from any webpage using Browser Rendering",
    usage: "GET /text?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
