/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /scan?url=https://example.com
 * Requires wrangler.json: "browser": { "binding": "BROWSER" }
 */
import { capturePage } from "../src/lib/browser";
import { buildScanReport } from "../src/lib/report";
import { validateUrl } from "../src/lib/url";

export default {
  async fetch(request: Request, env: { BROWSER: Fetcher }): Promise<Response> {
    const url = validateUrl(new URL(request.url).searchParams.get("url") ?? undefined);
    if (!url) {
      return Response.json(
        { error: "Missing or invalid url", code: "INVALID_URL" },
        { status: 400 }
      );
    }
    const capture = await capturePage(env.BROWSER, url);
    return Response.json(buildScanReport(url, capture));
  },
};
