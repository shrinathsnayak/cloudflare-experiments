/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: See this experiment's routes for the HTTP API.
 * Wire DEMO_HTML() the same way src/routes/ does (see that file for args / bindings).
 */
import { DEMO_HTML } from "../src/lib/demo-page";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: See this experiment's routes for the HTTP API.
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = DEMO_HTML(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
