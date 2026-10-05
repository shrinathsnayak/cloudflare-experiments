import { Hono } from "hono";
import type { Env } from "./types/env";
import radarRoutes from "./routes/radar";

const app = new Hono<{ Bindings: Env }>();

app.route("/", radarRoutes);

app.get("/", (c) => {
  return c.json({
    name: "radar-one-question",
    description: "Query Cloudflare Radar for one fact about a domain or ASN",
    usage: "GET /radar?domain=cloudflare.com or GET /radar?asn=13335",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
