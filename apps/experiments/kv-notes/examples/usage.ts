/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: POST /notes with { id, content }; GET /notes?id=...
 * Wire saveNote() the same way src/routes/ does (see that file for args / bindings).
 */
import { saveNote } from "../src/lib/note";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: POST /notes with { id, content }; GET /notes?id=...
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await saveNote(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
