import { Hono } from "hono";
import type { Env } from "../types/env";
import type { TranslateResponse } from "../types/translate";
import { resolveSourceLang, validateLang, validateText } from "../lib/text";
import { translateText } from "../lib/translate";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/translate", async (c) => {
  const text = validateText(c.req.query("text"));
  if (!text) {
    return jsonError(c, "Missing or invalid query parameter: text", "INVALID_TEXT");
  }

  const target = validateLang(c.req.query("target"));
  if (!target) {
    return jsonError(c, "Missing or invalid query parameter: target", "INVALID_TARGET");
  }

  const source = resolveSourceLang(c.req.query("source"));
  if (!source) {
    return jsonError(c, "Invalid query parameter: source", "INVALID_SOURCE");
  }

  try {
    const translation = await translateText(c.env, text, source, target);
    const response: TranslateResponse = { text, source, target, translation };
    return jsonSuccess(c, response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to translate text";
    return jsonError(c, message, "AI_ERROR", 502);
  }
});

export default app;
