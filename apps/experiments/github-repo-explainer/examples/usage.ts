/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /repo?url=https://github.com/user/project
 * Wire fetchRepoContent() the same way src/routes/ does (see that file for args / bindings).
 */
import { fetchRepoContent } from "../src/lib/github";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: GET /repo?url=https://github.com/user/project
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = await fetchRepoContent(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
