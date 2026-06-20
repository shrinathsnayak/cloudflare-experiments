import { MAX_MESSAGE_LENGTH } from "../constants/defaults";
import type { TaskMessage } from "../types/queue";

export function validateMessage(input: unknown): string | null {
  if (typeof input !== "string") {
    return null;
  }

  const message = input.trim();
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return null;
  }

  return message;
}

export function buildTaskMessage(message: string): TaskMessage {
  return {
    message,
    enqueuedAt: new Date().toISOString(),
  };
}
