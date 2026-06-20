import { Hono } from "hono";
import type { Env } from "./types/env";
import hashRoutes from "./routes/hash";

const app = new Hono<{ Bindings: Env }>();

app.route("/", hashRoutes);

app.get("/", (c) => {
  return c.json({
    name: "crypto-hash",
    description: "Compute SHA digests with the Web Crypto API at the edge",
    usage: "GET /hash?text=hello&algorithm=SHA-256",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
