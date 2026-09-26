import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { registerSearchTool, registerSourceTools } from "fumadocs-core/mcp";
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

export async function GET(request: Request) {
  return handler.fetch(request);
}

export async function POST(request: Request) {
  return handler.fetch(request);
}

export async function DELETE(request: Request) {
  return handler.fetch(request);
}
