import { Hono } from "hono";
import type { Env } from "../types/env";
import { getUrlByCode } from "../lib/links-cache";
import { jsonError } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/:code", async (c) => {
  const code = c.req.param("code");
  if (!code || !/^[a-zA-Z0-9]+$/.test(code)) {
    return jsonError(c, "Invalid short code", "INVALID_CODE", 404);
  }

  const url = await getUrlByCode(c.env, code);
  if (!url) {
    return jsonError(c, "Short link not found", "NOT_FOUND", 404);
  }

  return c.redirect(url, 302);
});

export default app;
