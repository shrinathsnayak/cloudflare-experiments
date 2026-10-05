import { Hono } from "hono";
import type { Env } from "../types/env";
import type { ChatRequestBody, ChatResponse } from "../types/chat";
import { runChat } from "../lib/chat";
import {
  validateModel,
  validatePrompt,
  validateMessages,
  validateMaxTokens,
  MAX_TOKENS_CAP,
} from "../lib/validate";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/chat", async (c) => {
  let body: ChatRequestBody;
  try {
    body = (await c.req.json()) as ChatRequestBody;
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }

  const model = validateModel(body.model);
  if (!model) return jsonError(c, "Missing or invalid body field: model", "MISSING_MODEL");

  const prompt = validatePrompt(body.prompt);
  const messages = validateMessages(body.messages);
  if (!prompt && !messages) {
    return jsonError(
      c,
      "Provide at least one of: prompt (string) or messages (array of { role, content })",
      "MISSING_PROMPT"
    );
  }

  const max_tokens = validateMaxTokens(body.max_tokens);
  if (body.max_tokens !== undefined && max_tokens === undefined) {
    return jsonError(
      c,
      `max_tokens must be an integer between 1 and ${MAX_TOKENS_CAP}`,
      "INVALID_MAX_TOKENS"
    );
  }

  const options: {
    prompt?: string;
    messages?: Array<{ role: string; content: string }>;
    max_tokens?: number;
  } = {};
  if (prompt) options.prompt = prompt;
  if (messages) options.messages = messages;
  if (max_tokens !== undefined) options.max_tokens = max_tokens;

  try {
    const response = await runChat(c.env, model, options);
    return jsonSuccess<ChatResponse>(c, { response });
  } catch {
    return jsonError(c, "AI request failed", "AI_ERROR", 502);
  }
});

app.get("/chat", async (c) => {
  const model = validateModel(c.req.query("model"));
  if (!model) return jsonError(c, "Missing or invalid query parameter: model", "MISSING_MODEL");

  const prompt = validatePrompt(c.req.query("prompt"));
  if (!prompt) return jsonError(c, "Missing or invalid query parameter: prompt", "MISSING_PROMPT");

  const maxTokensParam = c.req.query("max_tokens");
  const max_tokens = validateMaxTokens(maxTokensParam);
  if (maxTokensParam !== undefined && max_tokens === undefined) {
    return jsonError(
      c,
      `max_tokens must be an integer between 1 and ${MAX_TOKENS_CAP}`,
      "INVALID_MAX_TOKENS"
    );
  }

  const options: { prompt: string; max_tokens?: number } = { prompt };
  if (max_tokens !== undefined) options.max_tokens = max_tokens;

  try {
    const response = await runChat(c.env, model, options);
    return jsonSuccess<ChatResponse>(c, { response });
  } catch {
    return jsonError(c, "AI request failed", "AI_ERROR", 502);
  }
});

export default app;
