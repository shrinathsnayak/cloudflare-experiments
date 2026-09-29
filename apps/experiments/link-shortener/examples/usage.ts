/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: POST /shorten with { 
 * Wire generateCode() the same way src/routes/ does (see that file for args / bindings).
 */
import { generateCode } from "../src/lib/code";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: POST /shorten with { 
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = generateCode(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
