import type { Env } from "../types/env";
import { AI_MODEL } from "../constants/defaults";

type EmbeddingResult = {
  data?: number[][];
};

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;

  const raw = dot / denom;
  return Math.max(0, Math.min(1, raw));
}

export async function computeSimilarity(env: Env, text1: string, text2: string): Promise<number> {
  const out = (await env.AI.run(AI_MODEL, { text: [text1, text2] })) as EmbeddingResult;
  const vectors = out.data;

  if (!vectors || vectors.length < 2) {
    throw new Error("Embedding model returned insufficient vectors");
  }

  return cosineSimilarity(vectors[0], vectors[1]);
}
