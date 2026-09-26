import { Hono } from "hono";
import type { Env } from "../types/env";
import type { ChatPostRequest } from "../types/chat";
import {
  getChatHistory,
  postChatMessage,
  upgradeChatWebSocket,
  validateMessage,
  validateSessionId,
} from "../lib/chat";
import { jsonError, jsonSuccess } from "../utils/response";

const chatRoutes = new Hono<{ Bindings: Env }>();

chatRoutes.get("/chat", async (c) => {
  const sessionId = validateSessionId(c.req.query("sessionId"));
  if (!sessionId) {
    return jsonError(c, "Missing or invalid query parameter: sessionId", "INVALID_SESSION");
  }

  try {
    const history = await getChatHistory(c.env, sessionId);
    return jsonSuccess(c, { sessionId, messages: history.messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load chat history";
    return jsonError(c, message, "CHAT_ERROR", 502);
  }
});

chatRoutes.post("/chat", async (c) => {
  let body: ChatPostRequest;
  try {
    body = await c.req.json<ChatPostRequest>();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_BODY");
  }

  const sessionId = validateSessionId(body.sessionId);
  const message = validateMessage(body.message);
  if (!sessionId) {
    return jsonError(c, "Missing or invalid field: sessionId", "INVALID_SESSION");
  }
  if (!message) {
    return jsonError(c, "Missing or invalid field: message", "INVALID_MESSAGE");
  }

  try {
    const result = await postChatMessage(c.env, sessionId, message);
    return jsonSuccess(c, { sessionId, messages: result.messages });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Failed to post chat message";
    return jsonError(c, errMessage, "CHAT_ERROR", 502);
  }
});

chatRoutes.get("/ws", async (c) => {
  const sessionId = validateSessionId(c.req.query("sessionId"));
  if (!sessionId) {
    return jsonError(c, "Missing or invalid query parameter: sessionId", "INVALID_SESSION");
  }

  if (c.req.header("Upgrade")?.toLowerCase() !== "websocket") {
    return jsonError(c, "Expected WebSocket upgrade", "EXPECTED_WEBSOCKET");
  }

  return upgradeChatWebSocket(c.env, sessionId, c.req.raw);
});

export default chatRoutes;
