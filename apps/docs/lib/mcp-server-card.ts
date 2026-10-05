import { appName, siteUrl } from "@/lib/shared";

/** Shared with `app/api/mcp/route.ts` - keep name/version in sync. */
export const MCP_SERVER_INFO = {
  name: "cloudflare-experiments",
  title: appName,
  version: "1.0.0",
} as const;

/** Streamable HTTP path served by `app/api/mcp/route.ts`. */
export const MCP_TRANSPORT_ENDPOINT = "/api/mcp";

/**
 * SEP-1649 MCP Server Card for pre-connection discovery.
 * Public URI: `/.well-known/mcp/server-card.json`
 */
export function getMcpServerCard() {
  return {
    $schema: "https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json",
    version: "1.0",
    protocolVersion: "2025-06-18",
    serverInfo: {
      name: MCP_SERVER_INFO.name,
      title: MCP_SERVER_INFO.title,
      version: MCP_SERVER_INFO.version,
    },
    description:
      "Search and read Cloudflare Workers experiment documentation over MCP (Streamable HTTP).",
    documentationUrl: `${siteUrl}/docs`,
    url: `${siteUrl}${MCP_TRANSPORT_ENDPOINT}`,
    transport: {
      type: "streamable-http",
      endpoint: MCP_TRANSPORT_ENDPOINT,
    },
    capabilities: {
      tools: {},
    },
    authentication: {
      required: false,
    },
    tools: [
      {
        name: "search",
        title: "Search Docs",
        description: "Search docs pages with a query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            locale: { type: "string" },
          },
          required: ["query"],
        },
      },
      {
        name: "list_pages",
        title: "List Pages",
        description: "List all docs pages with their pathnames (URLs)",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_page",
        title: "Get Page",
        description: "Get the Markdown content of a docs page by its pathname (URL)",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string" },
          },
          required: ["url"],
        },
      },
    ],
  };
}
