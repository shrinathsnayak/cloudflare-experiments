import { Hono } from "hono";
import type { Env } from "./types/env";
import verifyRoutes from "./routes/verify";

const app = new Hono<{ Bindings: Env }>();

app.route("/", verifyRoutes);

app.get("/", (c) => {
  return c.json({
    name: "webhook-signature-verifier",
    description: "Verify webhook HMAC-SHA256 signatures with timing-safe comparison",
    usage: 'POST /verify {"payload":"...","secret":"...","signature":"sha256=..."}',
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
