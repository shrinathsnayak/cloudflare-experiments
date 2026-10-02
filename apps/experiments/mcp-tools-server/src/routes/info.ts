import { Hono } from "hono";
import type { Env } from "../types/env";
import { MCP_PATH, SERVER_NAME } from "../constants/defaults";
import { jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => {
  const endpoint = `${new URL(c.req.url).origin}${MCP_PATH}`;
  return jsonSuccess(c, {
    name: SERVER_NAME,
    description: "Remote MCP server exposing DNS, HTTP, uptime, and hashing tools",
    usage: {
      mcp: `POST ${MCP_PATH} (Streamable HTTP)`,
      inspector: `npx @modelcontextprotocol/inspector, then connect to ${endpoint}`,
    },
    mcpEndpoint: endpoint,
    tools: ["dns_lookup", "http_headers", "is_it_up", "hash_text"],
    mcpConfig: {
      mcpServers: {
        [SERVER_NAME]: { command: "npx", args: ["mcp-remote", endpoint] },
      },
    },
    cloudflareFeatures: ["Agents SDK (McpAgent)", "Durable Objects"],
  });
});

export default app;
