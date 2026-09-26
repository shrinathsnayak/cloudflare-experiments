import { Hono } from "hono";
import type { Env } from "./types/env";
import flagRoutes from "./routes/flags";

const app = new Hono<{ Bindings: Env }>();

app.route("/", flagRoutes);

app.get("/", (c) => {
  return c.json({
    name: "flagship-rollout",
    description: "Evaluate Cloudflare Flagship feature flags at the edge",
    usage: {
      value: "GET /flags/:key?userId=&default=true|false",
      details: "GET /flags/:key/details?userId=&default=true|false",
    },
    cloudflareFeatures: ["Flagship"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
