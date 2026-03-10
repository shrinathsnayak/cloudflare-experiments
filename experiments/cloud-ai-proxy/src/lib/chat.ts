import type { Env } from "../types/env";

type RunOptions = {
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
  max_tokens?: number;
};

export async function runChat(env: Env, model: string, options: RunOptions): Promise<string> {
  const out = await env.AI.run(model, {
    prompt: options.prompt,
    messages: options.messages,
    max_tokens: options.max_tokens,
  });
  const response =
    (out as { response?: string }).response ?? (out as { result?: string }).result ?? "";
  return response;
}
