import type { Env } from "../types/env";
import type { SearchResult } from "../types/search";

export async function upsertVector(
  env: Env,
  id: string,
  values: number[],
  text: string
): Promise<void> {
  await env.VECTORIZE.upsert([{ id, values, metadata: { text } }]);
}

export async function searchVectors(
  env: Env,
  values: number[],
  topK: number
): Promise<SearchResult[]> {
  const matches = await env.VECTORIZE.query(values, {
    topK,
    returnMetadata: "all",
  });

  return matches.matches.map((match) => ({
    id: match.id,
    score: match.score,
    text: typeof match.metadata?.text === "string" ? match.metadata.text : "",
  }));
}
