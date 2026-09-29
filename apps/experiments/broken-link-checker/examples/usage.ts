/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /check?url=https://www.cloudflare.com
 */
import { fetchPageHtml } from "../src/lib/check";
import { validateUrl } from "../src/lib/url";

export default {
  async fetch(request: Request): Promise<Response> {
    const raw = new URL(request.url).searchParams.get("url");
    const url = validateUrl(raw ?? undefined);
    if (!url) {
      return Response.json({ error: "Missing or invalid url", code: "INVALID_URL" }, { status: 400 });
    }
    const result = await fetchPageHtml(url);
    return Response.json(result);
  },
};
