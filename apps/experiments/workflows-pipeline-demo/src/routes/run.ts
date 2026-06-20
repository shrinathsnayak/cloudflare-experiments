import { Hono } from "hono";
import type { Env } from "../types/env";
import type { RunResponse } from "../types/workflow";
import { validateUrl } from "../lib/url";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/run", async (c) => {
  let body: { url?: string };
  try {
    body = await c.req.json<{ url?: string }>();
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }

  const url = validateUrl(body.url);
  if (!url) {
    return jsonError(c, "Missing or invalid body field: url (http or https only)", "INVALID_URL");
  }

  try {
    const instance = await c.env.PIPELINE.create({ params: { url } });
    const details = await instance.status();
    const response: RunResponse = {
      instanceId: instance.id,
      status: details.status ?? "unknown",
    };
    return jsonSuccess(c, response, 202);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start workflow";
    return jsonError(c, message, "WORKFLOW_ERROR", 502);
  }
});

export default app;
