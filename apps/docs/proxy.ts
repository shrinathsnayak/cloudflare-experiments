import { NextRequest, NextResponse } from "next/server";
import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";
import { docsContentRoute, docsRoute, homeRoute } from "@/lib/shared";
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
 * Markdown Accept negotiation covers `/` and `/docs`.
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

function isHomePath(pathname: string): boolean {
  return pathname === homeRoute;
}

function isNegotiablePath(pathname: string): boolean {
  return isHomePath(pathname) || isDocsPath(pathname);
}

function rewriteMarkdown(request: NextRequest, destination: string): NextResponse {
  const response = withSecurityHeaders(
    NextResponse.rewrite(new URL(destination, request.nextUrl)),
    MARKDOWN_CACHE_CONTROL
  );
  response.headers.set("Vary", "Accept");
  response.headers.set("Content-Type", "text/markdown; charset=utf-8");
  return response;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isMarkdownPreferred(request)) {
    if (isDocsPath(pathname)) {
      const result = rewriteLLM(pathname);
      if (result) return rewriteMarkdown(request, result);
    }

    if (isHomePath(pathname)) {
      return rewriteMarkdown(request, "/llms.txt");
    }
  }

  const response = withSecurityHeaders(
    NextResponse.next(),
    isDocsPath(pathname) ? DOCS_CACHE_CONTROL : undefined
  );
  if (isNegotiablePath(pathname)) {
    response.headers.set("Vary", "Accept");
  }
  return response;
}
