/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /check?domain=example.com
 * Wire checkEmailAuth() the same way src/routes/ does (see that file for args / bindings).
 */
import { checkEmailAuth } from "../src/lib/analyze";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: GET /check?domain=example.com
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await checkEmailAuth(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
