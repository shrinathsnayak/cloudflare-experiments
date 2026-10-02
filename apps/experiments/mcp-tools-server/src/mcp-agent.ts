import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SERVER_NAME, SERVER_VERSION } from "./constants/defaults";
import { registerTools } from "./lib/tools";
import type { Env } from "./types/env";

export class ToolsMcp extends McpAgent<Env> {
  server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

  async init(): Promise<void> {
    registerTools(this.server);
  }
}
