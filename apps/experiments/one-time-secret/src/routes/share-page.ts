import { Hono } from "hono";
import type { Env } from "../types/env";
import { isValidId } from "../lib/validate";
import { renderRevealPage } from "../lib/page";
import { generateId } from "../lib/crypto";
import { jsonError } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/s/:id", (c) => {
  const id = c.req.param("id");
  if (!isValidId(id)) return jsonError(c, "Secret not found", "NOT_FOUND", 404);

  const nonce = generateId();
  c.header(
    "Content-Security-Policy",
    `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`
  );
  c.header("Cache-Control", "no-store");
  c.header("Referrer-Policy", "no-referrer");
  c.header("X-Robots-Tag", "noindex");
  return c.html(renderRevealPage(id, nonce));
});

export default app;
