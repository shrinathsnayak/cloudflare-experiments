import {
  DEFAULT_INSTANCE_NAME,
  DEFAULT_MAX_RESULTS,
  MAX_QUERY_LENGTH,
} from "../constants/defaults";
import type { AISearchBinding, AISearchResult, Env } from "../types/env";
import type { SearchResponse } from "../types/search";

export function validateQuery(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_QUERY_LENGTH) return null;
  return trimmed;
}

/**
 * Wraps the evolving Workers AI Search / AutoRAG API behind a stable interface.
 * Prefer injecting a mock AISearchBinding in tests.
 */
export function createAISearchBinding(env: Env): AISearchBinding {
  const instanceName = env.INSTANCE_NAME?.trim() || DEFAULT_INSTANCE_NAME;

  return {
    async search(params: { query: string; max_num_results?: number }): Promise<AISearchResult> {
      const result = await env.AI.autorag(instanceName).aiSearch({
        query: params.query,
        max_num_results: params.max_num_results ?? DEFAULT_MAX_RESULTS,
      });
      return result as AISearchResult;
    },
  };
}

export async function runSearch(
  search: AISearchBinding,
  query: string,
  instanceName: string
): Promise<SearchResponse> {
  const result = await search.search({
    query,
    max_num_results: DEFAULT_MAX_RESULTS,
  });

  return {
    answer: result.response?.trim() || "",
    results: Array.isArray(result.data) ? result.data : [],
    query,
    instance: instanceName,
  };
}
