/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * One-off expiry check: GET /?domain=example.com
 */
import { checkDomain } from "../src/lib/expiry";
import { validateDomain } from "../src/lib/validate";

export default {
  async fetch(request: Request): Promise<Response> {
    const domain = validateDomain(new URL(request.url).searchParams.get("domain"));
    if (!domain) {
      return Response.json(
        { error: "Missing or invalid domain", code: "INVALID_DOMAIN" },
        { status: 400 }
      );
    }
    return Response.json(await checkDomain(domain));
  },
};
