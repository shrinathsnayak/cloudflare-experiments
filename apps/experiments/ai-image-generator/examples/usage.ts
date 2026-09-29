/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /generate?prompt=a sunset over mountains
 * Wire generateImage() the same way src/routes/ does (see that file for args / bindings).
 */
import { generateImage } from "../src/lib/generate";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: GET /generate?prompt=a sunset over mountains
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await generateImage(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
