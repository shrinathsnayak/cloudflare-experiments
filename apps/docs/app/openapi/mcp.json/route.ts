import { getMcpOpenApi } from "@/lib/api-catalog";
import { DOCS_CACHE_CONTROL, applySecurityHeaders } from "@/lib/security-headers";

export function GET() {
  const body = JSON.stringify(getMcpOpenApi());
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": DOCS_CACHE_CONTROL,
  });
  applySecurityHeaders(headers);
  return new Response(body, { headers });
}
