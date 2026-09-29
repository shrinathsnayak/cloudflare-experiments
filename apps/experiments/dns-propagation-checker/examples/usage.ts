/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /check?domain=example.com&type=A
 * Wire checkPropagation() the same way src/routes/ does (see that file for args / bindings).
 */
import { checkPropagation } from "../src/lib/doh";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: GET /check?domain=example.com&type=A
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await checkPropagation(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
