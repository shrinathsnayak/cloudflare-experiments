import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { registerSearchTool, registerSourceTools } from "fumadocs-core/mcp";
import { enforceApiRateLimit } from "@/lib/rate-limit";
import { applySecurityHeaders } from "@/lib/security-headers";
import { docsSearch } from "@/lib/search";
import { docsLlms, source } from "@/lib/source";

const handler = createMcpHandler(() => {
  const mcp = new McpServer({
    name: "cloudflare-experiments",
    version: "1.0.0",
  });

  registerSourceTools(mcp, source, docsLlms);
  registerSearchTool(mcp, docsSearch);

  return mcp;
});

async function handleMcp(request: Request): Promise<Response> {
  const limited = await enforceApiRateLimit(request, "mcp");
  if (limited) return limited;

  const response = await handler.fetch(request);
  const headers = new Headers(response.headers);
  applySecurityHeaders(headers);
  headers.set("Cache-Control", "no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function GET(request: Request) {
  return handleMcp(request);
}

export async function POST(request: Request) {
  return handleMcp(request);
}

export async function DELETE(request: Request) {
  return handleMcp(request);
}
