import { Hono } from "hono";
import type { Env } from "../types/env";
import type { TranscribeResponse } from "../types/env";
import { toBase64Audio, validateAudioFile } from "../lib/audio";
import { transcribeAudio } from "../lib/transcribe";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/transcribe", async (c) => {
  const form = await c.req.formData();
  const raw = form.get("audio");
  const file = raw && typeof raw === "object" && "arrayBuffer" in raw ? (raw as File) : null;

  const validated = await validateAudioFile(file);
  if (!validated) {
    return jsonError(
      c,
      "Missing or invalid audio file (max 2MB, audio/* types only)",
      "INVALID_AUDIO"
    );
  }

  const started = Date.now();
  try {
    const audioBase64 = toBase64Audio(validated.buffer);
    const result = await transcribeAudio(c.env, audioBase64);
    const response: TranscribeResponse = {
      text: result.text?.trim() ?? "",
      language: result.language,
      durationMs: Date.now() - started,
    };
    if (!response.text) {
      return jsonError(c, "Transcription returned empty text", "TRANSCRIBE_ERROR", 502);
    }
    return jsonSuccess(c, response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    return jsonError(c, message, "TRANSCRIBE_ERROR", 502);
  }
});

export default app;
