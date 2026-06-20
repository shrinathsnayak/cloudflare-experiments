import type { Env } from "../types/env";
import { AI_MODEL } from "../constants/defaults";

type ImageResult = {
  image?: string;
};

export async function generateImage(env: Env, prompt: string): Promise<Uint8Array> {
  const out = (await env.AI.run(AI_MODEL, { prompt })) as ImageResult;

  if (!out.image) {
    throw new Error("Image model returned no image");
  }

  const binaryString = atob(out.image);
  return Uint8Array.from(binaryString, (m) => m.codePointAt(0) ?? 0);
}
