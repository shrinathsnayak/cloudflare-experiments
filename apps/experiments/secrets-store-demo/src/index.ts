import { Hono } from "hono";
import type { Env } from "./types/env";
import secretRoutes from "./routes/secret";

const app = new Hono<{ Bindings: Env }>();

app.route("/", secretRoutes);

app.get("/", (c) => {
  return c.json({
    name: "secrets-store-demo",
    description: "Read account-scoped secrets from Cloudflare Secrets Store",
    usage: "GET /secret/status; GET /secret/verify?expected=...",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
