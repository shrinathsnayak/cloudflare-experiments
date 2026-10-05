import { MARKDOWN_CACHE_CONTROL, applySecurityHeaders } from "@/lib/security-headers";

const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";
const PLAIN_CONTENT_TYPE = "text/plain; charset=utf-8";

/** Character/4 estimate when a real tokenizer is not available. */
function estimateMarkdownTokens(text: string): number {
  return Math.max(0, Math.ceil(text.length / 4));
}

export function markdownResponse(
  body: string,
  options?: { contentType?: "text/markdown" | "text/plain" }
): Response {
  const contentType =
    options?.contentType === "text/plain" ? PLAIN_CONTENT_TYPE : MARKDOWN_CONTENT_TYPE;
  const headers = new Headers({
    "Content-Type": contentType,
    "Cache-Control": MARKDOWN_CACHE_CONTROL,
    Vary: "Accept",
    "x-markdown-tokens": String(estimateMarkdownTokens(body)),
  });
  applySecurityHeaders(headers);
  return new Response(body, { headers });
}
