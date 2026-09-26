/// <reference types="@cloudflare/workers-types" />

export type AIRunBinding = {
  run: (...args: unknown[]) => Promise<unknown>;
};

export type Env = {
  AI?: AIRunBinding | Ai;
  MODEL: string;
};
