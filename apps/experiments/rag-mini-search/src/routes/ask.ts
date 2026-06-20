import { Hono } from "hono";
import type { Env } from "../types/env";
import type { AskResponse } from "../types/env";
import { DEFAULT_TOP_K, MAX_QUESTION_LENGTH } from "../constants/defaults";
import { SEED_DOCUMENTS } from "../constants/docs";
import { generateGroundedAnswer } from "../lib/rag";
import { searchDocuments, upsertDocuments } from "../lib/vectorize";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

function validateQuestion(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_QUESTION_LENGTH) return null;
  return trimmed;
}

app.post("/ask", async (c) => {
  let body: { question?: unknown };
  try {
    body = await c.req.json<{ question?: unknown }>();
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }

  const question = validateQuestion(body.question);
  if (!question) {
    return jsonError(c, "Missing or invalid question (max 500 chars)", "INVALID_QUESTION");
  }

  try {
    const matches = await searchDocuments(c.env, question, DEFAULT_TOP_K);
    if (matches.length === 0) {
      return jsonError(
        c,
        "No indexed documents found. POST /seed to load the demo corpus first.",
        "NOT_INDEXED",
        404
      );
    }

    const contextBlocks = matches.map((match) => ({
      title: String(match.metadata?.title ?? match.id),
      text: String(match.metadata?.text ?? ""),
    }));

    const answer = await generateGroundedAnswer(c.env, question, contextBlocks);
    const response: AskResponse = {
      question,
      answer,
      sources: matches.map((match) => ({
        id: String(match.id),
        title: String(match.metadata?.title ?? match.id),
        score: match.score ?? 0,
      })),
    };
    return jsonSuccess(c, response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "RAG query failed";
    return jsonError(c, message, "RAG_ERROR", 502);
  }
});

app.post("/seed", async (c) => {
  try {
    const count = await upsertDocuments(c.env, SEED_DOCUMENTS);
    return jsonSuccess(c, { seeded: count, documents: SEED_DOCUMENTS.map((doc) => doc.title) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Seeding failed";
    return jsonError(c, message, "SEED_ERROR", 502);
  }
});

export default app;
