import { Hono } from "hono";
import type { Env } from "../types/env";
import type { ShortenRequestBody, ShortenResponse } from "../types/shorten";
import { validateUrl } from "../lib/url";
import { generateCode } from "../lib/code";
import { setCachedLink } from "../lib/links-cache";
import { jsonError } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/shorten", async (c) => {
  let body: ShortenRequestBody;
  try {
    body = (await c.req.json()) as ShortenRequestBody;
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }

  const url = validateUrl(body.url);
  if (!url) {
    return jsonError(c, "Missing or invalid body field: url (http or https only)", "INVALID_URL");
  }

  const db = c.env.DB;
  let code = generateCode();
  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await db.prepare("INSERT INTO links (code, url) VALUES (?, ?)").bind(code, url).run();
      await setCachedLink(c.env, code, url);
      return c.json({ code, url } satisfies ShortenResponse, 201);
    } catch (e) {
      const err = e as { message?: string };
      if (err.message?.includes("UNIQUE constraint")) {
        code = generateCode();
        continue;
      }
      throw e;
    }
  }
  return jsonError(c, "Could not generate unique code", "INTERNAL_ERROR", 502);
});

export default app;
