/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: POST /configs with { path, method, status, body, delayMs? }; GET /mock/:slug to invoke
 * Wire generateSlug() the same way src/routes/ does (see that file for args / bindings).
 */
import { generateSlug } from "../src/lib/mock";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: POST /configs with { path, method, status, body, delayMs? }; GET /mock/:slug to invoke
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = generateSlug(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
