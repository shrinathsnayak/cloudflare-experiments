import { describe, it, expect, vi } from "vitest";

const mcpFetch = vi.hoisted(() => vi.fn(async () => new Response("mcp", { status: 200 })));

vi.mock("agents/mcp", () => ({
  McpAgent: class {
    static serve() {
      return { fetch: mcpFetch };
    }
  },
}));

const { default: worker } = await import("../src/index");
const env = { MCP_OBJECT: {} as DurableObjectNamespace };
const ctx = {} as ExecutionContext;

describe("smoke", () => {
  it("GET / returns app info with MCP config", async () => {
    const res = await worker.fetch(new Request("https://tools.example.com/"), env, ctx);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      name?: string;
      description?: string;
      mcpEndpoint?: string;
      mcpConfig?: { mcpServers: Record<string, { args: string[] }> };
    };
    expect(body.name).toBe("mcp-tools-server");
    expect(body.description).toBeDefined();
    expect(body.mcpEndpoint).toBe("https://tools.example.com/mcp");
    expect(body.mcpConfig?.mcpServers["mcp-tools-server"].args).toEqual([
      "mcp-remote",
      "https://tools.example.com/mcp",
    ]);
  });

  it("forwards /mcp to the McpAgent handler", async () => {
    const res = await worker.fetch(
      new Request("https://tools.example.com/mcp", { method: "POST" }),
      env,
      ctx
    );
    expect(await res.text()).toBe("mcp");
    expect(mcpFetch).toHaveBeenCalledOnce();
  });

  it("returns 404 JSON for unknown paths", async () => {
    const res = await worker.fetch(new Request("https://tools.example.com/nope"), env, ctx);
    expect(res.status).toBe(404);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("NOT_FOUND");
  });
});
