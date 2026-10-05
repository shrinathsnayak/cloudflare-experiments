import { NextRequest, NextResponse } from "next/server";
import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";
import { applyDiscoveryLinkHeaders } from "@/lib/discovery-links";
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
    // Explicit: catch-all below skips paths ending in a file extension (e.g. .json / .md).
    "/.well-known/api-catalog",
    "/.well-known/mcp/server-card.json",
    "/.well-known/agent-skills/index.json",
    "/.well-known/agent-skills/:name/SKILL.md",
    "/((?!_next/static|_next/image|api/|llms|og/|openapi/|\\.well-known/|favicon|apple-touch-icon|.*\\.[a-z0-9]+$).*)",
  ],
};

const API_CATALOG_PATH = "/.well-known/api-catalog";
const API_CATALOG_INTERNAL = "/well-known/api-catalog";
const MCP_SERVER_CARD_PATH = "/.well-known/mcp/server-card.json";
const MCP_SERVER_CARD_INTERNAL = "/well-known/mcp/server-card.json";
const AGENT_SKILLS_INDEX_PATH = "/.well-known/agent-skills/index.json";
const AGENT_SKILLS_INDEX_INTERNAL = "/well-known/agent-skills/index.json";
const AGENT_SKILLS_MD_RE = /^\/\.well-known\/agent-skills\/([a-z0-9]+(?:-[a-z0-9]+)*)\/SKILL\.md$/;

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

function rewriteMarkdown(
  request: NextRequest,
  destination: string,
  options?: { discoveryLinks?: boolean }
): NextResponse {
  const response = withSecurityHeaders(
    NextResponse.rewrite(new URL(destination, request.nextUrl)),
    MARKDOWN_CACHE_CONTROL
  );
  response.headers.set("Vary", "Accept");
  response.headers.set("Content-Type", "text/markdown; charset=utf-8");
  if (options?.discoveryLinks) {
    applyDiscoveryLinkHeaders(response.headers);
  }
  return response;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Well-known URIs → internal routes (dot-folders are not reliable in app/).
  if (pathname === API_CATALOG_PATH) {
    return NextResponse.rewrite(new URL(API_CATALOG_INTERNAL, request.nextUrl));
  }
  if (pathname === MCP_SERVER_CARD_PATH) {
    return NextResponse.rewrite(new URL(MCP_SERVER_CARD_INTERNAL, request.nextUrl));
  }
  if (pathname === AGENT_SKILLS_INDEX_PATH) {
    return NextResponse.rewrite(new URL(AGENT_SKILLS_INDEX_INTERNAL, request.nextUrl));
  }
  const agentSkillMd = pathname.match(AGENT_SKILLS_MD_RE);
  if (agentSkillMd) {
    return NextResponse.rewrite(
      new URL(`/well-known/agent-skills/${agentSkillMd[1]}/SKILL.md`, request.nextUrl),
    );
  }

  if (isMarkdownPreferred(request)) {
    if (isDocsPath(pathname)) {
      const result = rewriteLLM(pathname);
      if (result) return rewriteMarkdown(request, result);
    }

    if (isHomePath(pathname)) {
      return rewriteMarkdown(request, "/llms.txt", { discoveryLinks: true });
    }
  }

  const response = withSecurityHeaders(
    NextResponse.next(),
    isDocsPath(pathname) ? DOCS_CACHE_CONTROL : undefined
  );
  if (isNegotiablePath(pathname)) {
    response.headers.set("Vary", "Accept");
  }
  // RFC 8288 / RFC 9727: advertise machine-readable discovery targets on `/`.
  if (isHomePath(pathname)) {
    applyDiscoveryLinkHeaders(response.headers);
  }
  return response;
}
