import { Hono } from "hono";
import type { Env } from "./types/env";
import { runReminderChecks } from "./lib/reminders";
import domainsRoutes from "./routes/domains";
import lookupRoutes from "./routes/lookup";

const app = new Hono<{ Bindings: Env }>();

app.route("/", domainsRoutes);
app.route("/", lookupRoutes);

app.get("/", (c) => {
  return c.json({
    name: "domain-expiry-reminder",
    description:
      "Track domain registration (RDAP) and TLS certificate (Certificate Transparency) expiry, with daily email reminders at 30, 7, and 1 days",
    usage: {
      watch: "POST /domains { domain, alertEmail }",
      status: "GET /domains/:id",
      remove: "DELETE /domains/:id",
      lookup: "GET /lookup?domain=example.com",
    },
    cloudflareFeatures: ["D1", "Cron Triggers", "Email Sending (send_email binding)"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runReminderChecks(env));
  },
};
