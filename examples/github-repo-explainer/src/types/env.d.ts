/// <reference types="@cloudflare/workers-types" />

export interface Env {
  AI: Ai;
}

interface Ai {
  run(model: string, options: { prompt?: string; max_tokens?: number }): Promise<{ response?: string; result?: string }>;
}
