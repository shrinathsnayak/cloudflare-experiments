import { Hono } from "hono";
import type { Env } from "./types/env";
import redirectChainRoutes from "./routes/redirect-chain";

const app = new Hono<{ Bindings: Env }>();

app.route("/", redirectChainRoutes);

app.get("/", (c) => {
  return c.json({
    name: "edge-redirect-simulator",
    description: "Show redirect chains for any URL",
    usage: "GET /redirect-chain?url=https://cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
