/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: GET /audit?url=https://example.com
 * Requires wrangler.json: "browser": { "binding": "BROWSER" }, "keep_names": false
 */
import { runAxeAudit } from "../src/lib/browser";
import { summarizeAxeResults } from "../src/lib/report";
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
    const { axe } = await runAxeAudit(env.BROWSER, url);
    return Response.json(summarizeAxeResults(url, axe));
  },
};
