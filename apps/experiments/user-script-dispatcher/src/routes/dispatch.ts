import { Hono } from "hono";
import type { Env } from "../types/env";
import { getScript, validateName } from "../lib/script";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/dispatch/:name", async (c) => {
  const name = validateName(c.req.param("name"));
  if (!name) {
    return jsonError(c, "Missing or invalid path parameter: name", "INVALID_NAME");
  }

  const dispatcher = c.env.DISPATCHER;
  if (dispatcher) {
    try {
      const stub = dispatcher.get(name);
      return stub.fetch(c.req.raw);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Dispatch failed";
      return jsonError(c, message, "DISPATCH_ERROR", 502);
    }
  }

  const record = await getScript(c.env.SCRIPTS, name);
  if (!record) {
    return jsonError(c, "Script not found", "NOT_FOUND", 404);
  }

  return jsonSuccess(c, record.response);
});

export default app;
