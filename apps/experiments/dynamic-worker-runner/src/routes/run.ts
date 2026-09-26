import { Hono } from "hono";
import type { Env } from "../types/env";
import type { RunRequest } from "../types/run";
import { runDynamicWorker, validateCode } from "../lib/runner";
import { jsonError, jsonSuccess } from "../utils/response";

const runRoutes = new Hono<{ Bindings: Env }>();

runRoutes.post("/run", async (c) => {
  let body: RunRequest;
  try {
    body = await c.req.json<RunRequest>();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_CODE");
  }

  const code = validateCode(body.code);
  if (!code) {
    return jsonError(
      c,
      "Missing or invalid field: code (non-empty, max 10000 chars). Must export default { fetch }.",
      "INVALID_CODE"
    );
  }

  try {
    const result = await runDynamicWorker(c.env, code);
    return jsonSuccess(c, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to run dynamic worker";
    return jsonError(c, message, "RUN_ERROR", 502);
  }
});

export default runRoutes;
