import { Hono } from "hono";
import type { Env } from "../types/env";
import type { GenerateRequest, GenerateResponse } from "../types/generate";
import { generateWithGateway } from "../lib/generate";
import { validateCompareCache, validatePrompt } from "../lib/validate";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/generate", async (c) => {
  let body: GenerateRequest;
  try {
    body = await c.req.json<GenerateRequest>();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_BODY");
  }

  const prompt = validatePrompt(body.prompt);
  if (!prompt) {
    return jsonError(c, "Missing or invalid field: prompt", "INVALID_PROMPT");
  }

  const compareCache = validateCompareCache(body.compareCache);

  try {
    const result = await generateWithGateway(c.env, prompt, compareCache);
    return jsonSuccess<GenerateResponse>(c, result);
  } catch {
    return jsonError(c, "AI Gateway request failed", "AI_ERROR", 502);
  }
});

export default app;
