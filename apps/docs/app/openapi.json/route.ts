import { getSiteOpenApi } from "@/lib/api-catalog";
import { getExperimentCount } from "@/lib/catalog.server";
import { DOCS_CACHE_CONTROL, applySecurityHeaders } from "@/lib/security-headers";

export function GET() {
  const body = JSON.stringify(getSiteOpenApi(getExperimentCount()));
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": DOCS_CACHE_CONTROL,
  });
  applySecurityHeaders(headers);
  return new Response(body, { headers });
}
