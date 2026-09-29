/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /turn-credentials?ttl=86400 or GET /ice-servers
 * Wire fetchTurnCredentials() the same way src/routes/ does (see that file for args / bindings).
 */
import { fetchTurnCredentials } from "../src/lib/turn";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: GET /turn-credentials?ttl=86400 or GET /ice-servers
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await fetchTurnCredentials(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
