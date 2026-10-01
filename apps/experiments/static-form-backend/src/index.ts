import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./types/env";
import formsRoutes from "./routes/forms";
import submitRoutes from "./routes/submit";

const app = new Hono<{ Bindings: Env }>();

// Per-form Origin enforcement happens in the POST handler; CORS only lets browsers read the reply.
app.use(
  "/f/*",
  cors({
    origin: (origin) => origin || "*",
    allowMethods: ["POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Accept"],
  })
);

app.route("/", submitRoutes);
app.route("/", formsRoutes);

app.get("/", (c) => {
  return c.json({
    name: "static-form-backend",
    description:
      "Contact-form backend for static sites: Turnstile, honeypot, rate limiting, D1 storage, and email notifications",
    usage: {
      createForm: "POST /forms { ownerEmail, allowedOrigin?, redirectUrl? } (Bearer ADMIN_TOKEN)",
      submit: "POST /f/:formId (urlencoded, multipart, or JSON)",
      submissions: "GET /forms/:id/submissions (Bearer ADMIN_TOKEN)",
    },
    cloudflareFeatures: ["D1", "Turnstile", "Rate Limiting binding", "Email Sending"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
