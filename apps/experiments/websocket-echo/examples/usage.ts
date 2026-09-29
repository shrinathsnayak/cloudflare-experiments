/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /echo (WebSocket upgrade)
 * Wire isWebSocketUpgrade() the same way src/routes/ does (see that file for args / bindings).
 */
import { isWebSocketUpgrade } from "../src/lib/websocket";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: GET /echo (WebSocket upgrade)
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = isWebSocketUpgrade(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
