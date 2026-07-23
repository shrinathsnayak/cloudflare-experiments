import { Hono } from "hono";
import type { Env } from "./types/env";
import checkRoutes from "./routes/check";

const app = new Hono<{ Bindings: Env }>();

app.route("/", checkRoutes);

app.get("/", (c) => {
  return c.json({
    name: "email-auth-checker",
    description:
      "Analyze SPF, DMARC, and DKIM email authentication records for a domain via Cloudflare DoH",
    usage: "GET /check?domain=example.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
