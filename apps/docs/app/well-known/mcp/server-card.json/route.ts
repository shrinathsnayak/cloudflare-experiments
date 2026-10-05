import { getMcpServerCard } from "@/lib/mcp-server-card";
import { MARKDOWN_CACHE_CONTROL, applySecurityHeaders } from "@/lib/security-headers";

/**
 * Internal route for the SEP-1649 MCP Server Card.
 * Public URI is `/.well-known/mcp/server-card.json` (rewritten in proxy.ts).
 * Vinext/Next file routing does not reliably register dot-folders under `app/`.
 */
export function GET() {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": MARKDOWN_CACHE_CONTROL,
  });
  applySecurityHeaders(headers);

  return new Response(JSON.stringify(getMcpServerCard(), null, 2), { headers });
}
