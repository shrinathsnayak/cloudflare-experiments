import { Hono } from "hono";
import type { Env } from "./types/env";
import infoRoutes from "./routes/info";
import { ToolsMcp } from "./mcp-agent";
import { MCP_PATH } from "./constants/defaults";
import { jsonError } from "./utils/response";

export { ToolsMcp };

const app = new Hono<{ Bindings: Env }>();

app.route("/", infoRoutes);

app.notFound((c) => jsonError(c, "Not found", "NOT_FOUND", 404));

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

const mcpHandler = ToolsMcp.serve(MCP_PATH, { binding: "MCP_OBJECT" });

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response> {
    if (new URL(request.url).pathname === MCP_PATH) {
      return mcpHandler.fetch(request, env, ctx);
    }
    return app.fetch(request, env, ctx);
  },
};
