/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: See this experiment's routes for the HTTP API.
 * Wire pingDatabase() the same way src/routes/ does (see that file for args / bindings).
 */
import { pingDatabase } from "../src/lib/db";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: See this experiment's routes for the HTTP API.
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await pingDatabase(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
