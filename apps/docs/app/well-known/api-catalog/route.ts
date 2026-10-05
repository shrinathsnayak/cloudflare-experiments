import { API_CATALOG_CONTENT_TYPE, getApiCatalog } from "@/lib/api-catalog";
import { DOCS_CACHE_CONTROL, applySecurityHeaders } from "@/lib/security-headers";
import { siteUrl } from "@/lib/shared";

/**
 * Internal route for the RFC 9727 api-catalog document.
 * Public URI is `/.well-known/api-catalog` (rewritten in proxy.ts).
 * Vinext/Next file routing does not reliably register dot-folders under `app/`.
 */

function catalogHeaders(): Headers {
  const headers = new Headers({
    "Content-Type": API_CATALOG_CONTENT_TYPE,
    "Cache-Control": DOCS_CACHE_CONTROL,
    Link: `<${siteUrl}/.well-known/api-catalog>; rel="api-catalog"`,
  });
  applySecurityHeaders(headers);
  return headers;
}

export function GET() {
  return new Response(JSON.stringify(getApiCatalog()), { headers: catalogHeaders() });
}

/** RFC 9727 §2: HEAD must resolve and include the api-catalog Link relation. */
export function HEAD() {
  return new Response(null, { headers: catalogHeaders() });
}
