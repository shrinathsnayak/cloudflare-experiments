import { AI_MODEL, MAX_MESSAGE_LENGTH, SESSION_ID_PATTERN } from "../constants/defaults";
import type { ChatHistoryResponse, ChatMessage, ChatPostResponse } from "../types/chat";
import type { Env } from "../types/env";

export function validateSessionId(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!SESSION_ID_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function validateMessage(input: string | undefined): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) return null;
  return trimmed;
}

export function stubAgentReply(message: string): string {
  return `agent: ${message}`;
}

type AiTextResponse = {
  response?: string;
};

export async function generateReply(ai: Ai | undefined, message: string): Promise<string> {
  if (!ai) {
    return stubAgentReply(message);
  }

  try {
    const result = (await ai.run(AI_MODEL, {
      messages: [{ role: "user", content: message }],
    })) as AiTextResponse;

    const response = result.response?.trim();
    if (response) return response;
  } catch {
    // Fall through to stub reply when AI is unavailable.
  }

  return stubAgentReply(message);
}

export function getChatStub(env: Env, sessionId: string): DurableObjectStub {
  const id = env.CHAT_AGENT.idFromName(sessionId);
  return env.CHAT_AGENT.get(id);
}

export async function postChatMessage(
  env: Env,
  sessionId: string,
  message: string
): Promise<ChatPostResponse> {
  const stub = getChatStub(env, sessionId);
  const response = await stub.fetch("https://chat-agent/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`Chat post failed with status ${response.status}`);
  }

  return (await response.json()) as ChatPostResponse;
}

export async function getChatHistory(env: Env, sessionId: string): Promise<ChatHistoryResponse> {
  const stub = getChatStub(env, sessionId);
  const response = await stub.fetch("https://chat-agent/chat");

  if (!response.ok) {
    throw new Error(`Chat history failed with status ${response.status}`);
  }

  return (await response.json()) as ChatHistoryResponse;
}

export async function upgradeChatWebSocket(
  env: Env,
  sessionId: string,
  request: Request
): Promise<Response> {
  const stub = getChatStub(env, sessionId);
  return stub.fetch("https://chat-agent/ws", request);
}

export function mapSqlRowsToMessages(
  rows: Array<{ id: number; role: string; content: string; created_at: string }>
): ChatMessage[] {
  return rows.map((row) => ({
    id: row.id,
    role: row.role === "assistant" ? "assistant" : "user",
    content: row.content,
    createdAt: row.created_at,
  }));
}
