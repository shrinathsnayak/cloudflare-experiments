import { Hono } from "hono";
import type { Env } from "./types/env";
import { sendDigest } from "./lib/digest";
import { handleNewsletter } from "./lib/email-handler";
import digestRoutes from "./routes/digest";
import itemsRoutes from "./routes/items";

const app = new Hono<{ Bindings: Env }>();

app.route("/", itemsRoutes);
app.route("/", digestRoutes);

app.get("/", (c) => {
  return c.json({
    name: "newsletter-digest",
    description:
      "Forward newsletters to an Email Routing address and get one Workers AI-summarized digest email per day",
    usage: {
      items: "GET /items?pending=true",
      preview: "POST /digest/preview",
      send: "POST /digest/send (Bearer ADMIN_TOKEN)",
      localEmail: "POST /cdn-cgi/handler/email?from=...&to=... (wrangler dev)",
    },
    cloudflareFeatures: [
      "Email Routing (email handler)",
      "Workers AI",
      "D1",
      "Cron Triggers",
      "Email Sending",
    ],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
  async email(message: ForwardableEmailMessage, env: Env, _ctx: ExecutionContext) {
    const result = await handleNewsletter(message, env);
    if (result.status !== "stored") console.log(`Newsletter ${result.status}: ${result.reason}`);
  },
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      sendDigest(env).then((result) => console.log("Digest run", JSON.stringify(result)))
    );
  },
};
