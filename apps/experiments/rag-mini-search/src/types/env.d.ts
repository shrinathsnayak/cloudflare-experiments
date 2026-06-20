/// <reference types="@cloudflare/workers-types" />

export interface Env {
  AI: Ai;
  VECTORIZE: VectorizeIndex;
}

export type AskResponse = {
  question: string;
  answer: string;
  sources: { title: string; id: string; score: number }[];
};
