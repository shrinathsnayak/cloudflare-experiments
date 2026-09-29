/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: PUT/GET/DELETE /files?path=...; GET /files/list?prefix=
 * Wire createR2ArtifactStore() the same way src/routes/ does (see that file for args / bindings).
 */
import { createR2ArtifactStore } from "../src/lib/artifacts";

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    // Typical API: PUT/GET/DELETE /files?path=...; GET /files/list?prefix=
    // Replace the placeholder call with the arguments used in this experiment's routes.
    const result = createR2ArtifactStore(/* args from src/routes/, env if needed */ env as never);
    return Response.json(result);
  },
};
