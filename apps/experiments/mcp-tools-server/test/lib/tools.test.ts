import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { registerTools } from "../../src/lib/tools";

type TextContent = { type: "text"; text: string };

let client: Client;

beforeEach(async () => {
  const server = new McpServer({ name: "test", version: "0.0.0" });
  registerTools(server);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: "test-client", version: "0.0.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
});

afterEach(async () => {
  await client.close();
  vi.unstubAllGlobals();
});

async function callTool(name: string, args: Record<string, unknown>) {
  const result = await client.callTool({ name, arguments: args });
  const [first] = result.content as TextContent[];
  return {
    isError: result.isError === true,
    data: JSON.parse(first.text) as Record<string, unknown>,
  };
}

describe("registerTools", () => {
  it("lists all tools", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "dns_lookup",
      "hash_text",
      "http_headers",
      "is_it_up",
    ]);
  });

  it("hash_text defaults to SHA-256", async () => {
    const { isError, data } = await callTool("hash_text", { text: "hello" });
    expect(isError).toBe(false);
    expect(data.algorithm).toBe("SHA-256");
  });

  it("http_headers rejects non-http URLs", async () => {
    const { isError, data } = await callTool("http_headers", { url: "file:///etc/passwd" });
    expect(isError).toBe(true);
    expect(data.code).toBe("INVALID_URL");
  });

  it("dns_lookup rejects invalid hostnames", async () => {
    const { isError, data } = await callTool("dns_lookup", { hostname: "not a host" });
    expect(isError).toBe(true);
    expect(data.code).toBe("INVALID_HOSTNAME");
  });

  it("dns_lookup surfaces upstream failures as DNS_ERROR", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 503 }))
    );
    const { isError, data } = await callTool("dns_lookup", {
      hostname: "cloudflare.com",
      type: "TXT",
    });
    expect(isError).toBe(true);
    expect(data.code).toBe("DNS_ERROR");
  });

  it("is_it_up returns uptime result", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("ok", { status: 200 }))
    );
    const { isError, data } = await callTool("is_it_up", { url: "https://example.com" });
    expect(isError).toBe(false);
    expect(data).toMatchObject({ url: "https://example.com/", up: true, status: 200 });
  });
});
