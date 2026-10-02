/// <reference types="@cloudflare/workers-types" />

export interface AiBinding {
  run(
    model: string,
    inputs: { messages: Array<{ role: string; content: string }>; max_tokens?: number }
  ): Promise<unknown>;
}

export interface Env {
  AI: AiBinding;
  DB: D1Database;
  EMAIL: SendEmail;
  DIGEST_FROM?: string;
  DIGEST_TO?: string;
  ALLOWED_SENDERS?: string;
  ADMIN_TOKEN?: string;
}
