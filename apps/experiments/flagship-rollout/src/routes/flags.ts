import { Hono } from "hono";
import type { Env } from "../types/env";
import {
  buildContext,
  evaluateBooleanFlag,
  evaluateBooleanFlagDetails,
  parseDefaultBoolean,
  validateFlagKey,
} from "../lib/flags";
import { jsonError, jsonSuccess } from "../utils/response";

const flagRoutes = new Hono<{ Bindings: Env }>();

flagRoutes.get("/flags/:key/details", async (c) => {
  const flagKey = validateFlagKey(c.req.param("key"));
  if (!flagKey) {
    return jsonError(c, "Missing or invalid flag key", "INVALID_FLAG_KEY");
  }

  const defaultValue = parseDefaultBoolean(c.req.query("default"));
  const context = buildContext(c.req.query("userId"));

  try {
    const result = await evaluateBooleanFlagDetails(c.env.FLAGS, flagKey, defaultValue, context);
    return jsonSuccess(c, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Flag evaluation failed";
    return jsonError(c, message, "FLAG_ERROR", 502);
  }
});

flagRoutes.get("/flags/:key", async (c) => {
  const flagKey = validateFlagKey(c.req.param("key"));
  if (!flagKey) {
    return jsonError(c, "Missing or invalid flag key", "INVALID_FLAG_KEY");
  }

  const defaultValue = parseDefaultBoolean(c.req.query("default"));
  const context = buildContext(c.req.query("userId"));

  try {
    const result = await evaluateBooleanFlag(c.env.FLAGS, flagKey, defaultValue, context);
    return jsonSuccess(c, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Flag evaluation failed";
    return jsonError(c, message, "FLAG_ERROR", 502);
  }
});

export default flagRoutes;
