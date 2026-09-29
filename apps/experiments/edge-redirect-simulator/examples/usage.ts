/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /redirect-chain?url=https://cloudflare.com
 * Wire getRedirectChain() the same way src/routes/ does (see that file for args / bindings).
 */
import { getRedirectChain } from "../src/lib/redirect-chain";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: GET /redirect-chain?url=https://cloudflare.com
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await getRedirectChain(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
