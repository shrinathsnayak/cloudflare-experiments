import { Hono } from "hono";
import type { Env } from "./types/env";
import testRoutes from "./routes/test";

const app = new Hono<{ Bindings: Env }>();

app.route("/", testRoutes);

app.get("/", (c) => {
  return c.json({
    name: "global-api-tester",
    description: "Test API endpoints from Cloudflare's global edge",
    usage: "GET /test?url=https://api.example.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
