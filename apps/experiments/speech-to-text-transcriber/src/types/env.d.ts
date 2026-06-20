/// <reference types="@cloudflare/workers-types" />

export interface Env {
  AI: Ai;
}

export type TranscribeResponse = {
  text: string;
  language?: string;
  durationMs: number;
};
