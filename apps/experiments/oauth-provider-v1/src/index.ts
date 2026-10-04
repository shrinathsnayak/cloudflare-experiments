import { AuthorizationServer, ResourceServer } from "@cloudflare/workers-oauth-provider";

interface Env {
  OAUTH_KV: KVNamespace;
  RESOURCE_SERVER: Fetcher;
}

// Authorization Server Worker
export const authServer = new AuthorizationServer({
  issuer: "https://oauth-demo.example.workers.dev",
  authorizeEndpoint: "/oauth/authorize",
  tokenEndpoint: "/oauth/token",
  scopesSupported: ["mcp:read", "mcp:write"],
  clients: [
    {
      id: "demo-client",
      name: "Demo MCP Client",
      redirectUris: ["http://localhost:3000/callback"],
    },
  ],
});

// MCP Resource Server Worker
export const mcpResource = new ResourceServer({
  issuer: "https://oauth-demo.example.workers.dev",
  audience: "https://mcp.example.workers.dev",
  scopesRequired: ["mcp:read"],
  apiHandler: async (request: Request, ctx: any) => {
    // Simple MCP endpoint
    if (new URL(request.url).pathname === "/mcp/tools") {
      return new Response(
        JSON.stringify({
          tools: [
            { name: "demo-tool", description: "A demo MCP tool" },
          ],
          scopes: ctx.auth.scopes,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Demonstrate insufficientScope step-up
    if (new URL(request.url).pathname === "/mcp/admin" && !ctx.auth.scopes.includes("mcp:write")) {
      return ctx.insufficientScope(["mcp:write"]);
    }

    return new Response("MCP Resource", { status: 200 });
  },
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Route to authorization server endpoints
    if (url.pathname.startsWith("/oauth/")) {
      return authServer.fetch(request, env, ctx);
    }
    
    // Route to MCP resource server
    if (url.pathname.startsWith("/mcp/")) {
      return mcpResource.fetch(request, env, ctx);
    }
    
    // Info endpoint
    return new Response(
      JSON.stringify({
        name: "oauth-provider-v1",
        description: "OAuth 2.1 provider with authorization server and MCP resource server",
        endpoints: {
          authorize: "/oauth/authorize",
          token: "/oauth/token",
          mcp: "/mcp/tools",
          admin: "/mcp/admin (requires mcp:write)",
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  },
};
