import { Hono } from "hono";
import type { Env } from "./types/env";
import verifyRoutes from "./routes/verify";

const app = new Hono<{ Bindings: Env }>();

app.route("/", verifyRoutes);

app.get("/", (c) => {
  return c.json({
    name: "turnstile-verify",
    description: "Verify Cloudflare Turnstile tokens via the siteverify API",
    usage: "POST /verify with JSON { token }",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
