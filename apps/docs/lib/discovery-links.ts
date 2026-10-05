/**
 * RFC 8288 / RFC 9727 agent-discovery Link values for the homepage.
 * Appended in proxy.ts so they merge with next/font preload Links.
 */
export const HOMEPAGE_DISCOVERY_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</docs>; rel="service-doc"; type="text/html"',
] as const;

export function applyDiscoveryLinkHeaders(headers: Headers): void {
  for (const link of HOMEPAGE_DISCOVERY_LINKS) {
    headers.append("Link", link);
  }
}
