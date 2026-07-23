import { Hono } from "hono";
import type { Env } from "./types/env";
import inboxRoutes from "./routes/inbox";
import { handleInboundEmail } from "./lib/email-handler";

const app = new Hono<{ Bindings: Env }>();

app.route("/", inboxRoutes);

app.get("/", (c) => {
  return c.json({
    name: "email-worker-inbox",
    description:
      "Receive inbound emails with Email Workers, store parsed messages in KV, and inspect them over HTTP",
    usage: {
      inbox: "GET /inbox",
      message: "GET /inbox/:id",
      localEmail: "POST /cdn-cgi/handler/email?from=...&to=... (wrangler local)",
    },
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
  async email(message: ForwardableEmailMessage, env: Env, _ctx: ExecutionContext) {
    await handleInboundEmail(message, env);
  },
};
