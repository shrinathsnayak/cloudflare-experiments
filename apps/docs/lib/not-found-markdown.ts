import { docsRoute, productScopeBlurb, siteUrl } from "@/lib/shared";
import { MARKDOWN_CACHE_CONTROL, applySecurityHeaders } from "@/lib/security-headers";

/** Recovery body for agents that request Accept: text/markdown on a missing URL. */
export function buildNotFoundMarkdown(pathname?: string): string {
  const pathLine = pathname?.trim()
    ? `The path \`${pathname}\` was not found on Cloudflare Experiments.`
    : "The requested path was not found on Cloudflare Experiments.";

  return `# 404 Not Found

${pathLine} ${productScopeBlurb}

## Where to go next

- Docs: ${siteUrl}${docsRoute}
- Blog: ${siteUrl}/blogs
- Homepage: ${siteUrl}/
- Agent index (llms.txt): ${siteUrl}/llms.txt
- Full markdown dump: ${siteUrl}/llms-full.txt
- Sitemap: ${siteUrl}/sitemap.xml
- OpenAPI: ${siteUrl}/openapi.json
- Developer resources: ${siteUrl}/developers
- API catalog: ${siteUrl}/.well-known/api-catalog
`;
}

export function markdownNotFoundResponse(pathname?: string): Response {
  const body = buildNotFoundMarkdown(pathname);
  const headers = new Headers({
    "Content-Type": "text/markdown; charset=utf-8",
    "Cache-Control": MARKDOWN_CACHE_CONTROL,
    Vary: "Accept",
  });
  applySecurityHeaders(headers);
  return new Response(body, { status: 404, headers });
}
