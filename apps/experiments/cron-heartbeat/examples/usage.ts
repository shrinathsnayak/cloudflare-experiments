/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /status
 * Wire recordHeartbeat() the same way src/routes/ does (see that file for args / bindings).
 */
import { recordHeartbeat } from "../src/lib/status";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: GET /status
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await recordHeartbeat(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
