import {
  DEFAULT_MODEL,
  MAX_REQUEST_ID_LENGTH,
  MAX_TEXT_LENGTH,
  MAX_TEXTS,
  MIN_TEXTS,
} from "../constants/defaults";
import type { BatchPollResponse, QueuedBatchResponse } from "../types/batch";
import type { AIRunBinding } from "../types/env";

export function resolveModel(model: string | undefined): string {
  const trimmed = model?.trim();
  return trimmed || DEFAULT_MODEL;
}

export function hasAIBinding(ai: unknown): ai is AIRunBinding {
  return (
    typeof ai === "object" &&
    ai !== null &&
    "run" in ai &&
    typeof (ai as AIRunBinding).run === "function"
  );
}

export function validateTexts(body: unknown): string[] | null {
  if (!body || typeof body !== "object") return null;
  const texts = (body as { texts?: unknown }).texts;
  if (!Array.isArray(texts)) return null;
  if (texts.length < MIN_TEXTS || texts.length > MAX_TEXTS) return null;

  const validated: string[] = [];
  for (const item of texts) {
    if (typeof item !== "string") return null;
    const trimmed = item.trim();
    if (!trimmed || trimmed.length > MAX_TEXT_LENGTH) return null;
    validated.push(trimmed);
  }
  return validated;
}

export function validateRequestId(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_REQUEST_ID_LENGTH) return null;
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) return null;
  return trimmed;
}

export function demoQueuedResponse(model: string): QueuedBatchResponse {
  return {
    status: "queued",
    model,
    request_id: `demo-${crypto.randomUUID()}`,
    mode: "demo",
    note: "AI binding unavailable; returning a demo queued response",
  };
}

export function demoPollResponse(requestId: string, model: string): BatchPollResponse {
  return {
    status: "completed",
    model,
    request_id: requestId,
    mode: "demo",
    note: "AI binding unavailable; returning demo poll results",
    responses: [
      {
        id: 0,
        success: true,
        result: {
          data: [0.1, 0.2, 0.3],
        },
      },
    ],
  };
}

function isQueuedResponse(value: unknown): value is QueuedBatchResponse {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    obj.status === "queued" && typeof obj.request_id === "string" && typeof obj.model === "string"
  );
}

export async function submitBatch(
  ai: AIRunBinding,
  model: string,
  texts: string[]
): Promise<QueuedBatchResponse> {
  const result = await ai.run(
    model,
    { requests: texts.map((text) => ({ text })) },
    { queueRequest: true }
  );

  if (!isQueuedResponse(result)) {
    throw new Error("Unexpected batch queue response shape");
  }

  return { ...result, mode: "live" };
}

export async function pollBatch(
  ai: AIRunBinding,
  model: string,
  requestId: string
): Promise<BatchPollResponse> {
  const result = await ai.run(model, { request_id: requestId });

  if (!result || typeof result !== "object") {
    throw new Error("Unexpected batch poll response shape");
  }

  return { ...(result as BatchPollResponse), mode: "live" };
}
