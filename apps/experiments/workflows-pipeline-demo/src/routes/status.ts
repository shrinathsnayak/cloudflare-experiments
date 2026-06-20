import { Hono } from "hono";
import type { Env } from "../types/env";
import type { PipelineResult, StatusResponse } from "../types/workflow";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/status/:instanceId", async (c) => {
  const instanceId = c.req.param("instanceId");
  if (!instanceId.trim()) {
    return jsonError(c, "Missing instance id", "INVALID_INSTANCE_ID");
  }

  try {
    const instance = await c.env.PIPELINE.get(instanceId);
    const details = await instance.status();
    const output = (details.output as PipelineResult | undefined) ?? null;
    const response: StatusResponse = {
      instanceId: instance.id,
      status: details.status ?? "unknown",
      output,
      error: details.error ? String(details.error) : null,
    };
    return jsonSuccess(c, response);
  } catch {
    return jsonError(c, "Workflow instance not found", "NOT_FOUND", 404);
  }
});

export default app;
