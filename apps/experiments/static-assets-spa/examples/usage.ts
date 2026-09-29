/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /api/hello — Worker first; other paths via env.ASSETS.fetch
 *
 * In wrangler.json enable Static Assets + ASSETS binding and run_worker_first for /api/*.
 */
export default {
  async fetch(request: Request, env: { ASSETS?: Fetcher }): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/hello") {
      return Response.json({ message: "hello from worker" });
    }
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return Response.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
  },
};
