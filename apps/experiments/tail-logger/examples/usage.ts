/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /logs; DELETE /logs — configure producers with tail_consumers
 * Wire extractLogMessages() the same way src/routes/ does (see that file for args / bindings).
 */
import { extractLogMessages } from "../src/lib/logs";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: GET /logs; DELETE /logs — configure producers with tail_consumers
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = extractLogMessages(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
