/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /resize?url=https://example.com/image.jpg&width=800&fit=scale-down
 * Wire buildImageOptions() the same way src/routes/ does (see that file for args / bindings).
 */
import { buildImageOptions } from "../src/lib/resize";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: GET /resize?url=https://example.com/image.jpg&width=800&fit=scale-down
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = buildImageOptions(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
