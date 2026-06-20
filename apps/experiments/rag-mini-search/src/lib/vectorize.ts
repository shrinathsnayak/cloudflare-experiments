import type { Env } from "../types/env";
import { AI_EMBED_MODEL } from "../constants/defaults";
import type { SeedDocument } from "../constants/docs";

type EmbeddingResult = { data?: number[][] };

export async function embedText(env: Env, text: string): Promise<number[]> {
  const out = (await env.AI.run(AI_EMBED_MODEL, { text })) as EmbeddingResult;
  const vector = out.data?.[0];
  if (!vector?.length) throw new Error("Embedding model returned no vectors");
  return vector;
}

export async function upsertDocuments(env: Env, docs: SeedDocument[]): Promise<number> {
  const vectors = await Promise.all(
    docs.map(async (doc) => ({
      id: doc.id,
      values: await embedText(env, `${doc.title}. ${doc.text}`),
      metadata: { title: doc.title, text: doc.text },
    }))
  );
  await env.VECTORIZE.upsert(vectors);
  return vectors.length;
}

export async function searchDocuments(env: Env, question: string, topK: number) {
  const values = await embedText(env, question);
  const result = await env.VECTORIZE.query(values, { topK, returnMetadata: "all" });
  return result.matches ?? [];
}
