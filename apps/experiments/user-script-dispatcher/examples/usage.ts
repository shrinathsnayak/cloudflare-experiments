/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: POST /scripts { name, response }; POST /dispatch/:name; POST /register { name }; GET /customers
 * Wire saveScript() the same way src/routes/ does (see that file for args / bindings).
 */
import { saveScript } from "../src/lib/script";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: POST /scripts { name, response }; POST /dispatch/:name; POST /register { name }; GET /customers
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await saveScript(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
