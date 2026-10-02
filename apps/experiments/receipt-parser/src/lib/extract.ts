import { MAX_MARKDOWN_CHARS, MAX_OUTPUT_TOKENS, TEXT_MODEL } from "../constants/defaults";
import { EXTRACTION_SYSTEM_PROMPT, RECEIPT_JSON_SCHEMA } from "../constants/schema";

/** JSON mode may return `response` as an already-parsed object or as a JSON string. */
export function parseModelJson(output: unknown): unknown {
  const response =
    output && typeof output === "object" ? (output as { response?: unknown }).response : output;

  if (response && typeof response === "object") return response;
  if (typeof response === "string") {
    const cleaned = response
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```$/, "")
      .trim();
    return JSON.parse(cleaned);
  }
  throw new Error("Model returned no structured output");
}

/**
 * Extracts receipt fields from Markdown using a JSON-mode text model. The model occasionally
 * degenerates and runs into max_tokens with truncated JSON, so an unparseable result is retried once.
 */
export async function extractReceiptFields(ai: Ai, markdown: string): Promise<unknown> {
  const run = () =>
    ai.run(TEXT_MODEL, {
      messages: [
        { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
        { role: "user", content: markdown.slice(0, MAX_MARKDOWN_CHARS) },
      ],
      response_format: { type: "json_schema", json_schema: RECEIPT_JSON_SCHEMA },
      temperature: 0,
      max_tokens: MAX_OUTPUT_TOKENS,
    });

  try {
    return parseModelJson(await run());
  } catch (err) {
    if (!(err instanceof SyntaxError)) throw err;
    return parseModelJson(await run());
  }
}
