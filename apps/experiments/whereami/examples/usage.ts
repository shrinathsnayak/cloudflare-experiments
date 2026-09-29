/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Bare Workers version (no Hono). For the Hono helper used by this experiment,
 * see `src/lib/cf.ts`.
 */
export default {
  async fetch(request: Request): Promise<Response> {
    return Response.json(request.cf ?? {});
  },
};
