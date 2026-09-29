/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: POST /upsert { id, text } | GET /search?q=&topK=5
 * Wire searchVectors() the same way src/routes/ does (see that file for args / bindings).
 */
import { searchVectors } from "../src/lib/vectorize";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: POST /upsert { id, text } | GET /search?q=&topK=5
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await searchVectors(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
