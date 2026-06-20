import { Hono } from "hono";
import type { Env } from "./types/env";
import jwtRoutes from "./routes/jwt";

const app = new Hono<{ Bindings: Env }>();

app.route("/", jwtRoutes);

app.get("/", (c) => {
  return c.json({
    name: "jwt-inspector",
    description: "Decode, verify, and issue JWTs for experimentation",
    usage: {
      decode: 'POST /decode { "token" }',
      verify: 'POST /verify { "token", "secret"|"publicKey" }',
      issue: 'POST /issue { "secret", "subject?", "expiresInSeconds?" }',
    },
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
