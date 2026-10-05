import { Hono } from "hono";
import type { Env } from "./types/env";
import indicatorsRoutes from "./routes/indicators";

const app = new Hono<{ Bindings: Env }>();

app.route("/", indicatorsRoutes);

app.get("/", (c) => {
  return c.json({
    name: "threat-signals-feed",
    description: "Query Cloudflare Threat Signals for structured threat indicators",
    usage: "GET /indicators - List threat indicators from your account",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
