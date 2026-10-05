import { appName, siteDescription, siteUrl } from "@/lib/shared";

/** RFC 9727 + RFC 9264 linkset media type (with profile). */
export const API_CATALOG_CONTENT_TYPE =
  'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"';

type LinkTarget = {
  href: string;
  type?: string;
};

type ApiCatalogEntry = {
  anchor: string;
  "service-desc": LinkTarget[];
  "service-doc": LinkTarget[];
  status?: LinkTarget[];
};

export type ApiCatalogDocument = {
  linkset: ApiCatalogEntry[];
};

/** Machine-readable API catalog for automated discovery (RFC 9727). */
export function getApiCatalog(): ApiCatalogDocument {
  const health: LinkTarget = {
    href: `${siteUrl}/api/health`,
    type: "application/json",
  };
  const docs: LinkTarget = {
    href: `${siteUrl}/llms.txt`,
    type: "text/plain",
  };

  return {
    linkset: [
      {
        anchor: `${siteUrl}/api/search`,
        "service-desc": [
          {
            href: `${siteUrl}/openapi/search.json`,
            type: "application/json",
          },
        ],
        "service-doc": [docs],
        status: [health],
      },
      {
        anchor: `${siteUrl}/api/mcp`,
        "service-desc": [
          {
            href: `${siteUrl}/openapi/mcp.json`,
            type: "application/json",
          },
        ],
        "service-doc": [docs],
        status: [health],
      },
    ],
  };
}

/** OpenAPI 3.1 for the docs search API. */
export function getSearchOpenApi(experimentCount: number) {
  return {
    openapi: "3.1.0",
    info: {
      title: `${appName} Search API`,
      description: `Full-text search across ${experimentCount} Cloudflare Workers experiment docs.`,
      version: "1.0.0",
    },
    servers: [{ url: siteUrl }],
    paths: {
      "/api/search": {
        get: {
          operationId: "searchDocs",
          summary: "Search experiment documentation",
          parameters: [
            {
              name: "query",
              in: "query",
              required: true,
              schema: { type: "string", minLength: 1 },
              description: "Search query string",
            },
            {
              name: "tag",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Comma-separated filter tags",
            },
            {
              name: "locale",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1 },
            },
            {
              name: "mode",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["full", "vector"], default: "full" },
            },
          ],
          responses: {
            "200": {
              description: "Ranked search hits (empty array when query is missing)",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        type: {
                          type: "string",
                          enum: ["page", "heading", "text"],
                        },
                        content: { type: "string" },
                        url: { type: "string" },
                      },
                      required: ["id", "type", "content", "url"],
                    },
                  },
                },
              },
            },
            "429": {
              description: "Rate limit exceeded",
            },
          },
        },
      },
    },
  };
}

/** OpenAPI 3.1 for the site MCP endpoint (Streamable HTTP). */
export function getMcpOpenApi() {
  return {
    openapi: "3.1.0",
    info: {
      title: `${appName} MCP Server`,
      description:
        "Model Context Protocol (MCP) server exposing docs search and source tools over Streamable HTTP.",
      version: "1.0.0",
    },
    servers: [{ url: siteUrl }],
    paths: {
      "/api/mcp": {
        post: {
          operationId: "mcpJsonRpc",
          summary: "MCP Streamable HTTP (JSON-RPC)",
          description:
            "Send MCP JSON-RPC messages. Prefer an MCP client over hand-crafted requests.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    jsonrpc: { type: "string", const: "2.0" },
                    method: { type: "string" },
                    params: {},
                    id: {
                      oneOf: [{ type: "string" }, { type: "number" }, { type: "null" }],
                    },
                  },
                  required: ["jsonrpc", "method"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "JSON-RPC response or SSE stream",
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
            },
            "405": {
              description: "Method not allowed for this transport action",
            },
            "429": {
              description: "Rate limit exceeded",
            },
          },
        },
        get: {
          operationId: "mcpGet",
          summary: "MCP Streamable HTTP GET",
          responses: {
            "405": {
              description: "GET is not used for this MCP transport configuration",
            },
          },
        },
        delete: {
          operationId: "mcpDelete",
          summary: "End MCP session",
          responses: {
            "200": { description: "Session closed" },
            "405": { description: "Method not allowed" },
          },
        },
      },
    },
  };
}

/** Short human blurb for llms.txt / agents. */
export function apiCatalogLlmsLines(experimentCount: number): string {
  return [
    `- API catalog (RFC 9727): ${siteUrl}/.well-known/api-catalog`,
    `- Search API: ${siteUrl}/api/search?query={query}`,
    `- Search OpenAPI: ${siteUrl}/openapi/search.json`,
    `- MCP endpoint: ${siteUrl}/api/mcp`,
    `- MCP Server Card: ${siteUrl}/.well-known/mcp/server-card.json`,
    `- MCP OpenAPI: ${siteUrl}/openapi/mcp.json`,
    `- Health: ${siteUrl}/api/health`,
    `- Site description: ${siteDescription(experimentCount)}`,
  ].join("\n");
}
