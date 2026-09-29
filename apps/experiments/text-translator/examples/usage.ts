/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /translate?text=hello&target=es&source=en
 * Wire translateText() the same way src/routes/ does (see that file for args / bindings).
 */
import { translateText } from "../src/lib/translate";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: GET /translate?text=hello&target=es&source=en
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await translateText(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
