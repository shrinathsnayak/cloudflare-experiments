/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: POST /events with a JSON object, array, or { events: [...] }; GET /events/sample
 * Wire ingestEvents() the same way src/routes/ does (see that file for args / bindings).
 */
import { ingestEvents } from "../src/lib/events";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: POST /events with a JSON object, array, or { events: [...] }; GET /events/sample
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await ingestEvents(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
