/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /similarity?text1=hello&text2=hi
 * Wire computeSimilarity() the same way src/routes/ does (see that file for args / bindings).
 */
import { computeSimilarity } from "../src/lib/similarity";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: GET /similarity?text1=hello&text2=hi
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await computeSimilarity(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
