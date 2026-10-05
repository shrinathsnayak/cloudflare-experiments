import type { Env } from "../types/env";

export type DecisionQuestion =
  | { type: "noul"; question: string }
  | { type: "choice"; question: string; choices: string[] };

export type DecisionModel = "@cf/cloudflare/clef" | "@cf/cloudflare/clef-flash";

export type DecisionResult = {
  model: DecisionModel;
  state: string;
  questions: DecisionQuestion[];
  answers: unknown;
};

export async function runDecision(
  env: Env,
  state: string,
  questions: DecisionQuestion[],
  model: DecisionModel = "@cf/cloudflare/clef"
): Promise<DecisionResult> {
  const answers = await env.AI.run(model, {
    state,
    questions,
  });

  return {
    model,
    state,
    questions,
    answers,
  };
}
