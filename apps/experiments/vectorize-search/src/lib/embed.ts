import type { Env } from "../types/env";
import { AI_MODEL } from "../constants/defaults";

type EmbeddingResult = {
  data?: number[][];
};

export async function embedText(env: Env, text: string): Promise<number[]> {
  const out = (await env.AI.run(AI_MODEL, { text })) as EmbeddingResult;
  const vectors = out.data;

  if (!vectors || vectors.length === 0 || !vectors[0]?.length) {
    throw new Error("Embedding model returned no vectors");
  }

  return vectors[0];
}
