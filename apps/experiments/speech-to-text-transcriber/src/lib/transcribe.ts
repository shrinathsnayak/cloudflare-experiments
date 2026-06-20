import type { Env } from "../types/env";
import { AI_MODEL } from "../constants/defaults";

type WhisperResult = {
  text?: string;
  language?: string;
};

export async function transcribeAudio(env: Env, audioBase64: string): Promise<WhisperResult> {
  const out = await env.AI.run(AI_MODEL, {
    audio: audioBase64,
  });
  return out as WhisperResult;
}
