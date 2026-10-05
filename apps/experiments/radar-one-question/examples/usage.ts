/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 */
import { getRadarFact } from "../src/lib/radar";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const domain = url.searchParams.get("domain") ?? undefined;
    const asn = url.searchParams.get("asn") ?? undefined;

    if (!domain && !asn) {
      return Response.json(
        { error: "Missing domain or asn", code: "MISSING_PARAMETER" },
        { status: 400 }
      );
    }

    if (domain && asn) {
      return Response.json(
        { error: "Provide only one of domain or asn", code: "INVALID_PARAMETER" },
        { status: 400 }
      );
    }

    const result = await getRadarFact(domain, asn);
    return Response.json(result);
  },
};
