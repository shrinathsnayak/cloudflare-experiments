import { Hono } from "hono";
import type { Env } from "./types/env";
import meRoutes from "./routes/me";
import protectedRoutes from "./routes/protected";
import { getAccessConfig } from "./lib/access";

const app = new Hono<{ Bindings: Env }>();

app.route("/", meRoutes);
app.route("/", protectedRoutes);

app.get("/", (c) => {
  return c.json({
    name: "access-jwt-validator",
    description: "Verify Cloudflare Access JWTs at the edge with jose and the team JWKS",
    usage: {
      me: "GET /me (Cf-Access-Jwt-Assertion header or CF_Authorization cookie)",
      protected: "GET /protected (example route behind the requireAccess middleware)",
    },
    configured: getAccessConfig(c.env ?? {}) !== null,
    cloudflareFeatures: ["Cloudflare Access (Zero Trust)", "Workers"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
