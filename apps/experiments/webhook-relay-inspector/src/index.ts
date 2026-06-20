import { Hono } from "hono";
import type { Env } from "./types/env";
import relayRoutes from "./routes/relay";

const app = new Hono<{ Bindings: Env }>();

app.route("/", relayRoutes);

app.get("/", (c) => {
  return c.json({
    name: "webhook-relay-inspector",
    description:
      "Create temporary webhook endpoints and inspect captured HTTP requests with Durable Objects",
    usage: {
      create: "POST /relay/new",
      capture: "ALL /relay/:id",
      list: "GET /relay/:id/requests",
      detail: "GET /relay/:id/requests/:requestId",
    },
    cloudflareFeatures: ["Durable Objects"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export { WebhookRelay } from "./webhook-relay";
export default { fetch: app.fetch };
