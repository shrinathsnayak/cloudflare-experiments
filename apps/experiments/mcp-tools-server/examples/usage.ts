/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Needs a Durable Object binding named MCP_OBJECT for ToolsMcp
 * (migration: new_sqlite_classes) and the nodejs_compat flag.
 * Connect clients to https://<your-worker>/mcp.
 */
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "../src/lib/tools";

export class ToolsMcp extends McpAgent {
  server = new McpServer({ name: "my-tools", version: "1.0.0" });

  async init(): Promise<void> {
    registerTools(this.server);
  }
}

export default ToolsMcp.serve("/mcp", { binding: "MCP_OBJECT" });
