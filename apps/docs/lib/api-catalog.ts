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

const problemSchema = {
  type: "object",
  description: "Structured API error agents can parse without scraping HTML.",
  properties: {
    error: { type: "string", description: "Human-readable error message" },
    code: {
      type: "string",
      description: "Stable machine-readable error code (e.g. NOT_FOUND, RATE_LIMITED)",
    },
    hint: {
      type: "string",
      description: "What to try next (resolution guidance for agents)",
    },
  },
  required: ["error", "code", "hint"],
  additionalProperties: true,
} as const;

const searchHitSchema = {
  type: "object",
  properties: {
    id: { type: "string", description: "Stable hit identifier" },
    type: {
      type: "string",
      enum: ["page", "heading", "text"],
      description: "Which part of the page matched",
    },
    content: { type: "string", description: "Matched text snippet" },
    url: { type: "string", description: "Docs URL for this hit" },
  },
  required: ["id", "type", "content", "url"],
} as const;

const errorResponse = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ApiError" },
    },
  },
});

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
  const openapi: LinkTarget = {
    href: `${siteUrl}/openapi.json`,
    type: "application/json",
  };

  return {
    linkset: [
      {
        anchor: `${siteUrl}/api/search`,
        "service-desc": [
          openapi,
          {
            href: `${siteUrl}/openapi/search.json`,
            type: "application/json",
          },
        ],
        "service-doc": [docs, { href: `${siteUrl}/developers`, type: "text/html" }],
        status: [health],
      },
      {
        anchor: `${siteUrl}/api/mcp`,
        "service-desc": [
          openapi,
          {
            href: `${siteUrl}/openapi/mcp.json`,
            type: "application/json",
          },
        ],
        "service-doc": [docs, { href: `${siteUrl}/developers`, type: "text/html" }],
        status: [health],
      },
      {
        anchor: `${siteUrl}/api/health`,
        "service-desc": [openapi],
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
      description: `Full-text search across ${experimentCount} Cloudflare product experiment docs. Returns ranked JSON hits for agents and the docs UI.`,
      version: "1.0.0",
    },
    servers: [{ url: siteUrl }],
    paths: {
      "/api/search": {
        get: {
          operationId: "searchDocs",
          summary: "Search experiment documentation",
          description:
            "Full-text search over Cloudflare Experiments docs. Pass a non-empty query; optional tag filters narrow results. Rate-limited per client IP.",
          parameters: [
            {
              name: "query",
              in: "query",
              required: true,
              schema: { type: "string", minLength: 1 },
              description: "Search query string (e.g. durable objects, workers ai)",
            },
            {
              name: "tag",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Comma-separated filter tags matching experiment frontmatter tags",
            },
            {
              name: "locale",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Optional locale hint for localized docs indexes",
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1 },
              description: "Maximum number of hits to return",
            },
            {
              name: "mode",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["full", "vector"], default: "full" },
              description: "Search mode: full-text (default) or vector when configured",
            },
          ],
          responses: {
            "200": {
              description: "Ranked search hits (empty array when query is missing)",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: searchHitSchema,
                  },
                },
              },
            },
            "429": errorResponse("Rate limit exceeded - retry after Retry-After seconds"),
          },
        },
      },
    },
    components: {
      schemas: {
        ApiError: problemSchema,
        SearchHit: searchHitSchema,
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
        "Model Context Protocol (MCP) server exposing docs search and source tools over Streamable HTTP. Prefer an MCP client; hand-crafted JSON-RPC is supported for debugging.",
      version: "1.0.0",
    },
    servers: [{ url: siteUrl }],
    paths: {
      "/api/mcp": {
        post: {
          operationId: "mcpJsonRpc",
          summary: "MCP Streamable HTTP (JSON-RPC)",
          description:
            "Send MCP JSON-RPC messages (initialize, tools/list, tools/call, etc.) over Streamable HTTP. Prefer an MCP client over hand-crafted requests.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    jsonrpc: { type: "string", const: "2.0" },
                    method: { type: "string", description: "MCP JSON-RPC method name" },
                    params: { description: "Method-specific parameters" },
                    id: {
                      oneOf: [{ type: "string" }, { type: "number" }, { type: "null" }],
                      description: "Request id (omit for notifications)",
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
                  schema: {
                    type: "object",
                    properties: {
                      jsonrpc: { type: "string", const: "2.0" },
                      result: { description: "Successful result payload" },
                      error: {
                        type: "object",
                        properties: {
                          code: { type: "integer" },
                          message: { type: "string" },
                        },
                      },
                      id: {
                        oneOf: [{ type: "string" }, { type: "number" }, { type: "null" }],
                      },
                    },
                    required: ["jsonrpc"],
                  },
                },
              },
            },
            "405": errorResponse("Method not allowed for this transport action"),
            "429": errorResponse("Rate limit exceeded"),
          },
        },
        get: {
          operationId: "mcpGet",
          summary: "MCP Streamable HTTP GET",
          description:
            "Optional GET for Streamable HTTP transports that support SSE streams. May return 405 when unused for this deployment.",
          responses: {
            "200": {
              description: "SSE stream when supported",
              content: {
                "text/event-stream": {
                  schema: { type: "string" },
                },
              },
            },
            "405": errorResponse("GET is not used for this MCP transport configuration"),
          },
        },
        delete: {
          operationId: "mcpDelete",
          summary: "End MCP session",
          description: "Close an MCP Streamable HTTP session when session ids are in use.",
          responses: {
            "200": {
              description: "Session closed",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    additionalProperties: true,
                  },
                },
              },
            },
            "405": errorResponse("Method not allowed"),
          },
        },
      },
    },
    components: {
      schemas: {
        ApiError: problemSchema,
      },
    },
  };
}

/** Combined OpenAPI 3.1 document (canonical discovery at /openapi.json). */
export function getSiteOpenApi(experimentCount: number) {
  const search = getSearchOpenApi(experimentCount);
  const mcp = getMcpOpenApi();

  return {
    openapi: "3.1.0",
    info: {
      title: `${appName} Site API`,
      description: `Public HTTP APIs for ${appName}: docs search, MCP Streamable HTTP, and health. ${siteDescription(experimentCount)} Errors use JSON { error, code, hint }.`,
      version: "1.0.0",
      contact: {
        name: appName,
        url: `${siteUrl}/contact`,
      },
    },
    servers: [{ url: siteUrl }],
    paths: {
      "/api/health": {
        get: {
          operationId: "getHealth",
          summary: "Liveness / health check",
          description:
            "Returns JSON status for uptime probes and API catalog status links. No authentication required.",
          responses: {
            "200": {
              description: "Service is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", const: "ok" },
                      name: { type: "string" },
                      time: { type: "string", format: "date-time" },
                    },
                    required: ["status", "name", "time"],
                  },
                },
              },
            },
            "405": errorResponse("Only GET is allowed"),
          },
        },
      },
      ...search.paths,
      ...mcp.paths,
    },
    components: {
      schemas: {
        ApiError: problemSchema,
        SearchHit: searchHitSchema,
      },
    },
  };
}

/** Short human blurb for llms.txt / agents. */
export function apiCatalogLlmsLines(experimentCount: number): string {
  return [
    `- API catalog (RFC 9727): ${siteUrl}/.well-known/api-catalog`,
    `- OpenAPI (all site APIs): ${siteUrl}/openapi.json`,
    `- Search API: ${siteUrl}/api/search?query={query}`,
    `- Search OpenAPI: ${siteUrl}/openapi/search.json`,
    `- MCP endpoint: ${siteUrl}/api/mcp`,
    `- MCP Server Card: ${siteUrl}/.well-known/mcp/server-card.json`,
    `- MCP OpenAPI: ${siteUrl}/openapi/mcp.json`,
    `- Health: ${siteUrl}/api/health`,
    `- Developer resources: ${siteUrl}/developers`,
    `- Site description: ${siteDescription(experimentCount)}`,
  ].join("\n");
}
