/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /secret/status; GET /secret/verify?expected=...
 * Wire verifySecret() the same way src/routes/ does (see that file for args / bindings).
 */
import { verifySecret } from "../src/lib/secret";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: GET /secret/status; GET /secret/verify?expected=...
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await verifySecret(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
