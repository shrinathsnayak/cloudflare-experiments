import { Hono } from "hono";
import type { Env } from "./types/env";
import counterRoutes from "./routes/counter";

const app = new Hono<{ Bindings: Env }>();

app.route("/", counterRoutes);

app.get("/", (c) => {
  return c.json({
    name: "durable-counter",
    description:
      "Reference implementation for Durable Objects - a globally consistent counter with persistent state",
    usage: {
      get: "GET /counter",
      increment: "POST /counter/increment",
      reset: "POST /counter/reset",
    },
    cloudflareFeatures: ["Durable Objects"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export { Counter } from "./counter";
export default {
  fetch: app.fetch,
};
