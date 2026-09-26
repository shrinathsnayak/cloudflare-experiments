import { Hono } from "hono";
import type { Env } from "./types/env";
import emailRoutes from "./routes/send";

const app = new Hono<{ Bindings: Env }>();

app.route("/", emailRoutes);

app.get("/", (c) => {
  return c.json({
    name: "transactional-email",
    description: "Send transactional email via the Cloudflare Email Service binding",
    usage: {
      send: 'POST /send with { "to": "...", "subject": "...", "text": "..." }',
    },
    cloudflareFeatures: ["Email Sending (send_email binding)"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
