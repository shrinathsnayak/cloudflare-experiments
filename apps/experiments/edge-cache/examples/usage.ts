/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 */
import { fetchWithEdgeCache } from "../src/lib/cache";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url).searchParams.get("url");
    if (!url) {
      return Response.json({ error: "Missing url", code: "INVALID_URL" }, { status: 400 });
    }
    const result = await fetchWithEdgeCache({
      url,
      cache: caches.default,
      bypass: false,
    });
    return Response.json(result);
  },
};
