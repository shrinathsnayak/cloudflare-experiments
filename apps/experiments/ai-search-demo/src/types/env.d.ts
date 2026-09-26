/// <reference types="@cloudflare/workers-types" />

export type AISearchResult = {
  response?: string;
  data?: unknown[];
};

export type AISearchBinding = {
  search(params: { query: string; max_num_results?: number }): Promise<AISearchResult>;
};

export interface Env {
  AI: Ai;
  INSTANCE_NAME: string;
}
