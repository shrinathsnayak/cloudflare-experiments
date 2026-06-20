import { Hono } from "hono";
import type { Env } from "./types/env";
import dnsRoutes from "./routes/dns";

const app = new Hono<{ Bindings: Env }>();

app.route("/", dnsRoutes);

app.get("/", (c) => {
  return c.json({
    name: "url-dns-lookup",
    description: "Get DNS records for the hostname of any URL",
    usage: "GET /dns?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
