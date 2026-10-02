import { docsSearch } from "@/lib/search";
import { enforceApiRateLimit } from "@/lib/rate-limit";
import { SEARCH_CACHE_CONTROL, applySecurityHeaders } from "@/lib/security-headers";

const searchGet = docsSearch.GET;

export async function GET(request: Request) {
  const limited = await enforceApiRateLimit(request, "search");
  if (limited) return limited;

  const response = await searchGet(request);
  const headers = new Headers(response.headers);
  applySecurityHeaders(headers);
  headers.set("Cache-Control", SEARCH_CACHE_CONTROL);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
