import { Hono } from "hono";
import type { Env } from "./types/env";
import configsRoutes from "./routes/configs";
import mockRoutes from "./routes/mock";

const app = new Hono<{ Bindings: Env }>();

app.route("/", configsRoutes);
app.route("/", mockRoutes);

app.get("/", (c) => {
  return c.json({
    name: "api-mock-server",
    description: "Create and serve configurable API mocks stored in Workers KV",
    usage: "POST /configs with { path, method, status, body, delayMs? }; GET /mock/:slug to invoke",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
