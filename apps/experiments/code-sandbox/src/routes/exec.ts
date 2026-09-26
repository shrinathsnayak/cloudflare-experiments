import { Hono } from "hono";
import type { Env } from "../types/env";
import type { ExecRequest } from "../types/exec";
import { execJavascript } from "../lib/exec";
import { validateCode, validateLanguage } from "../lib/validate";
import { jsonError, jsonSuccess } from "../utils/response";

const execRoutes = new Hono<{ Bindings: Env }>();

execRoutes.post("/exec", async (c) => {
  let body: ExecRequest;
  try {
    body = await c.req.json<ExecRequest>();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_BODY");
  }

  const language = validateLanguage(body.language);
  if (!language) {
    return jsonError(
      c,
      'Missing or invalid field: language (supported: "javascript")',
      "INVALID_LANGUAGE"
    );
  }

  const code = validateCode(body.code);
  if (!code) {
    return jsonError(
      c,
      "Missing or invalid field: code (non-empty, max 5000 chars)",
      "INVALID_CODE"
    );
  }

  try {
    const result = await execJavascript(c.env, code);
    return jsonSuccess(c, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sandbox execution failed";
    return jsonError(c, message, "EXEC_ERROR", 502);
  }
});

export default execRoutes;
