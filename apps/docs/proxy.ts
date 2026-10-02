import { NextRequest, NextResponse } from "next/server";
import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";
import { docsContentRoute, docsRoute } from "@/lib/shared";
import {
  DOCS_CACHE_CONTROL,
  MARKDOWN_CACHE_CONTROL,
  applySecurityHeaders,
} from "@/lib/security-headers";

const { rewrite: rewriteLLM } = rewritePath(
  `${docsRoute}{/*path}`,
  `${docsContentRoute}{/*path}/content.md`
);

/** Only negotiate markdown on docs routes - keep sitemap/robots off the proxy path. */
export const config = {
  matcher: ["/docs", "/docs/:path*"],
};

function withDocsHeaders(response: NextResponse, cacheControl: string): NextResponse {
  applySecurityHeaders(response.headers);
  response.headers.set("Cache-Control", cacheControl);
  response.headers.set("Vary", "Accept");
  return response;
}

export default function proxy(request: NextRequest) {
  if (isMarkdownPreferred(request)) {
    const result = rewriteLLM(request.nextUrl.pathname);

    if (result) {
      return withDocsHeaders(
        NextResponse.rewrite(new URL(result, request.nextUrl)),
        MARKDOWN_CACHE_CONTROL
      );
    }
  }

  return withDocsHeaders(NextResponse.next(), DOCS_CACHE_CONTROL);
}
