import { Hono } from "hono";
import type { Env } from "./types/env";
import headersRoutes from "./routes/headers";

const app = new Hono<{ Bindings: Env }>();

app.route("/", headersRoutes);

app.get("/", (c) => {
  return c.json({
    name: "response-headers",
    description: "Inspect HTTP response headers for any URL from the edge",
    usage: "GET /headers?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
