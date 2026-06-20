import type { Env } from "../types/env";
import { AI_MODEL } from "../constants/defaults";

type SentimentLabel = {
  label?: string;
  score?: number;
};

export type SentimentResult = {
  label: string;
  score: number;
};

export async function analyzeSentiment(env: Env, text: string): Promise<SentimentResult> {
  const out = (await env.AI.run(AI_MODEL, { text })) as SentimentLabel[];

  if (!Array.isArray(out) || out.length === 0) {
    throw new Error("Sentiment model returned invalid output");
  }

  const best = out.reduce(
    (prev, curr) => ((curr.score ?? 0) > (prev.score ?? 0) ? curr : prev),
    out[0]
  );

  if (!best.label || best.score === undefined) {
    throw new Error("Sentiment model returned incomplete labels");
  }

  return { label: best.label, score: best.score };
}
