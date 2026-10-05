import { Hono } from "hono";
import type { Env } from "./types/env";
import keygenRoutes from "./routes/keygen";

const app = new Hono<{ Bindings: Env }>();

app.route("/", keygenRoutes);

app.get("/", (c) => {
  return c.json({
    name: "ml-kem",
    description:
      "Generate ML-KEM-768 key pairs, encapsulate, and decapsulate to verify shared secrets",
    usage: "GET /keygen",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
