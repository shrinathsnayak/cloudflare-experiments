import { Hono } from "hono";
import type { Env } from "./types/env";
import checkRoutes from "./routes/check";

const app = new Hono<{ Bindings: Env }>();

app.route("/", checkRoutes);

app.get("/", (c) => {
  return c.json({
    name: "dns-propagation-checker",
    description:
      "Compare DNS answers from Cloudflare, Google, and Quad9 resolvers to spot propagation drift",
    usage: "GET /check?domain=example.com&type=A",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
