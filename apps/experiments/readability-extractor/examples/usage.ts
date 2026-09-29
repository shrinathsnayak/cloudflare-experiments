/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /extract?url=https://blog.cloudflare.com
 * Wire extractReadableContent() the same way src/routes/ does (see that file for args / bindings).
 */
import { extractReadableContent } from "../src/lib/browser";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: GET /extract?url=https://blog.cloudflare.com
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await extractReadableContent(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
