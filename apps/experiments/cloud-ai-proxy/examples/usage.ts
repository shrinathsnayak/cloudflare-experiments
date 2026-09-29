/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: POST /chat with { model, prompt? } or GET /chat?model=...&prompt=...
 * Wire runChat() the same way src/routes/ does (see that file for args / bindings).
 */
import { runChat } from "../src/lib/chat";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: POST /chat with { model, prompt? } or GET /chat?model=...&prompt=...
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await runChat(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
