import { Hono } from "hono";
import type { Env } from "../types/env";
import { jsonSuccess, jsonError } from "../utils/response";

type Question =
  | { type: "noul"; question: string }
  | { type: "choice"; question: string; choices: string[] };

interface DecisionRequest {
  state: string;
  questions: Question[];
  model?: "@cf/cloudflare/clef" | "@cf/cloudflare/clef-flash";
}

const app = new Hono<{ Bindings: Env }>();

app.post("/decision", async (c) => {
  let body: DecisionRequest;

  try {
    body = await c.req.json();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_JSON", 400);
  }

  const { state, questions, model = "@cf/cloudflare/clef" } = body;

  if (!state || !questions || !Array.isArray(questions) || questions.length === 0) {
    return jsonError(
      c,
      "Missing or invalid required fields: state (string) and questions (array)",
      "INVALID_REQUEST",
      400
    );
  }

  try {
    const result = await c.env.AI.run(model, {
      state,
      questions,
    });

    return jsonSuccess(c, {
      model,
      state,
      questions,
      answers: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(c, `Workers AI error: ${message}`, "AI_ERROR", 502);
  }
});

export default app;
