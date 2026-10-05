import type { Metadata } from "next";
import { StaticPageShell } from "@/components/static-page-shell";
import { appName, brandProductName, githubRepoUrl, siteUrl } from "@/lib/shared";

export const metadata: Metadata = {
  title: `${brandProductName} developer resources: API, OpenAPI, MCP, llms.txt`,
  description: `Machine-readable developer resources for ${appName}: OpenAPI, API catalog, MCP server, Agent Skills, llms.txt, and auth notes.`,
};

const resources = [
  {
    name: "OpenAPI specification",
    href: `${siteUrl}/openapi.json`,
    format: "application/json",
    purpose: "Typed operations for search, MCP, and health - function-calling friendly.",
  },
  {
    name: "API catalog (RFC 9727)",
    href: `${siteUrl}/.well-known/api-catalog`,
    format: "application/linkset+json",
    purpose: "Discover service-desc / service-doc links for site APIs.",
  },
  {
    name: "Search API",
    href: `${siteUrl}/api/search?query=workers+ai`,
    format: "application/json",
    purpose: "Full-text search across experiment docs.",
  },
  {
    name: "MCP server",
    href: `${siteUrl}/api/mcp`,
    format: "MCP Streamable HTTP",
    purpose: "Tools for search and reading docs source over MCP.",
  },
  {
    name: "MCP server card",
    href: `${siteUrl}/.well-known/mcp/server-card.json`,
    format: "application/json",
    purpose: "Pre-connection MCP discovery (SEP-1649).",
  },
  {
    name: "Agent Skills index",
    href: `${siteUrl}/.well-known/agent-skills/index.json`,
    format: "application/json",
    purpose: "List SKILL.md artifacts agents can fetch.",
  },
  {
    name: "llms.txt",
    href: `${siteUrl}/llms.txt`,
    format: "text/plain",
    purpose: "When-to-use guidance, API links, and experiment catalog.",
  },
  {
    name: "llms-full.txt",
    href: `${siteUrl}/llms-full.txt`,
    format: "text/plain",
    purpose: "Full docs dump as Markdown/plain text.",
  },
  {
    name: "Health",
    href: `${siteUrl}/api/health`,
    format: "application/json",
    purpose: "Liveness probe for monitors and API catalog status links.",
  },
  {
    name: "Source monorepo",
    href: githubRepoUrl,
    format: "git",
    purpose: "Clone experiments, run tests, and Deploy to Cloudflare.",
  },
] as const;

export default function DevelopersPage() {
  return (
    <StaticPageShell
      title={`${brandProductName} developer resources`}
      description={`${appName} developer resources: API docs, OpenAPI spec, MCP server, Agent Skills, and llms.txt - predictable URLs for agents and humans.`}
    >
      <p>
        Use this page when you searched for <strong>{brandProductName}</strong> developer resources,
        API documentation, OpenAPI, MCP, or authentication notes. Public site APIs are read-oriented
        and do not require OAuth API keys today; errors return JSON{" "}
        <code>{`{ error, code, hint }`}</code>.
      </p>
      <h2>Authentication</h2>
      <p>
        No API key is required for <code>/api/search</code>, <code>/api/mcp</code>, or{" "}
        <code>/api/health</code>. Abuse is limited with per-IP rate limits (HTTP 429 +{" "}
        <code>Retry-After</code>). Individual Worker experiments you deploy may define their own
        auth (Access JWT, Turnstile, secrets) - see each experiment&apos;s docs under{" "}
        <code>/docs/experiments/</code>.
      </p>
      <h2>Catalog of surfaces</h2>
      <ul>
        {resources.map((resource) => (
          <li key={resource.href}>
            <a href={resource.href}>{resource.name}</a> ({resource.format}) - {resource.purpose}
          </li>
        ))}
      </ul>
      <h2>Quick start for agents</h2>
      <ol>
        <li>
          Read <a href={`${siteUrl}/llms.txt`}>{siteUrl}/llms.txt</a> for when-to-use guidance.
        </li>
        <li>
          Load <a href={`${siteUrl}/openapi.json`}>{siteUrl}/openapi.json</a> for operationIds and
          schemas.
        </li>
        <li>
          Call <code>GET /api/search?query=…</code> or connect MCP at <code>POST /api/mcp</code>.
        </li>
      </ol>
    </StaticPageShell>
  );
}
