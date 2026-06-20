import { Hono } from "hono";
import type { Env } from "./types/env";
import testRoutes from "./routes/test";

const app = new Hono<{ Bindings: Env }>();

app.route("/", testRoutes);

app.get("/", (c) => {
  return c.json({
    name: "cors-preflight-tester",
    description: "Send an OPTIONS preflight and report CORS header coverage",
    usage:
      'POST /test {"url":"https://api.example.com/resource","origin":"https://app.example.com","method":"POST","headers":["Authorization"]}',
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
