/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: POST /transcribe (multipart form field: audio)
 * Wire transcribeAudio() the same way src/routes/ does (see that file for args / bindings).
 */
import { transcribeAudio } from "../src/lib/transcribe";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: POST /transcribe (multipart form field: audio)
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await transcribeAudio(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
