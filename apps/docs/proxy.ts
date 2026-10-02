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

/**
 * Apply security headers on HTML document routes. Skip hashed static assets.
 * Markdown Accept negotiation stays scoped to `/docs`.
 */
export const config = {
  matcher: [
    "/",
    "/docs",
    "/docs/:path*",
    "/((?!_next/static|_next/image|api/|llms|og/|favicon|apple-touch-icon|.*\\.[a-z0-9]+$).*)",
  ],
};

function withSecurityHeaders(response: NextResponse, cacheControl?: string): NextResponse {
  applySecurityHeaders(response.headers);
  if (cacheControl) {
    response.headers.set("Cache-Control", cacheControl);
  }
  return response;
}

function isDocsPath(pathname: string): boolean {
  return pathname === docsRoute || pathname.startsWith(`${docsRoute}/`);
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isDocsPath(pathname) && isMarkdownPreferred(request)) {
    const result = rewriteLLM(pathname);

    if (result) {
      const response = withSecurityHeaders(
        NextResponse.rewrite(new URL(result, request.nextUrl)),
        MARKDOWN_CACHE_CONTROL
      );
      response.headers.set("Vary", "Accept");
      return response;
    }
  }

  const response = withSecurityHeaders(
    NextResponse.next(),
    isDocsPath(pathname) ? DOCS_CACHE_CONTROL : undefined
  );
  if (isDocsPath(pathname)) {
    response.headers.set("Vary", "Accept");
  }
  return response;
}
