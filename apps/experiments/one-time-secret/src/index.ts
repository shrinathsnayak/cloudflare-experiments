import { Hono } from "hono";
import type { Env } from "./types/env";
import secretRoutes from "./routes/secrets";
import sharePageRoutes from "./routes/share-page";

export { SecretVault } from "./secret-vault";

const app = new Hono<{ Bindings: Env }>();

app.route("/", secretRoutes);
app.route("/", sharePageRoutes);

app.get("/", (c) => {
  return c.json({
    name: "one-time-secret",
    description: "Share a secret via a self-destructing, end-to-end keyed link",
    usage: {
      create: 'POST /secrets { "secret": "...", "ttlSeconds": 3600 }',
      status: "GET /secrets/:id",
      reveal: 'POST /secrets/:id/reveal { "key": "..." }',
      page: "GET /s/:id#<key>",
    },
    cloudflareFeatures: ["Durable Objects", "Alarm API", "Web Crypto (AES-GCM)"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
