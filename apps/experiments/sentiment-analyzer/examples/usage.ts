/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /sentiment?text=This pizza is great!
 * Wire analyzeSentiment() the same way src/routes/ does (see that file for args / bindings).
 */
import { analyzeSentiment } from "../src/lib/sentiment";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: GET /sentiment?text=This pizza is great!
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await analyzeSentiment(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
