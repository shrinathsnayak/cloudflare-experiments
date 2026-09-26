import { Hono } from "hono";
import type { Env } from "../types/env";
import type { SaveScriptRequest } from "../types/script";
import { MAX_SCRIPT_BYTES } from "../constants/defaults";
import { getScript, saveScript, validateName, validateResponse } from "../lib/script";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/scripts", async (c) => {
  const name = validateName(c.req.query("name"));
  if (!name) {
    return jsonError(c, "Missing or invalid query parameter: name", "INVALID_NAME");
  }

  const record = await getScript(c.env.SCRIPTS, name);
  if (!record) {
    return jsonError(c, "Script not found", "NOT_FOUND", 404);
  }

  return jsonSuccess(c, {
    name: record.name,
    updatedAt: record.updatedAt,
    hasResponse: true,
  });
});

app.post("/scripts", async (c) => {
  let body: SaveScriptRequest;
  try {
    body = await c.req.json<SaveScriptRequest>();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_BODY");
  }

  const name = validateName(body.name);
  const response = validateResponse(body.response);
  if (!name) {
    return jsonError(c, "Missing or invalid field: name", "INVALID_NAME");
  }
  if (!response) {
    return jsonError(c, "Missing or invalid field: response", "INVALID_RESPONSE");
  }

  const record = await saveScript(c.env.SCRIPTS, name, response);
  if (!record) {
    return jsonError(c, `Script exceeds max size of ${MAX_SCRIPT_BYTES} bytes`, "SCRIPT_TOO_LARGE");
  }

  return jsonSuccess(c, record);
});

export default app;
