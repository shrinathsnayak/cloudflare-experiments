import { docsLlms } from "@/lib/source";
import { MARKDOWN_CACHE_CONTROL, applySecurityHeaders } from "@/lib/security-headers";

export async function GET() {
  const headers = new Headers({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": MARKDOWN_CACHE_CONTROL,
  });
  applySecurityHeaders(headers);
  return new Response(await docsLlms.index(), { headers });
}
