import { Hono } from "hono";
import type { Env } from "./types/env";
import scriptsRoutes from "./routes/scripts";
import dispatchRoutes from "./routes/dispatch";
import customersRoutes from "./routes/customers";

const app = new Hono<{ Bindings: Env }>();

app.route("/", scriptsRoutes);
app.route("/", dispatchRoutes);
app.route("/", customersRoutes);

app.get("/", (c) => {
  return c.json({
    name: "user-script-dispatcher",
    description:
      "Workers for Platforms style dispatch — run tenant scripts via DispatchNamespace or KV response handlers",
    usage:
      "POST /scripts { name, response }; POST /dispatch/:name; POST /register { name }; GET /customers",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
