# MCP Tools Server

A remote [Model Context Protocol](https://modelcontextprotocol.io) server on Cloudflare Workers, built with the Agents SDK `McpAgent` (one SQLite-backed Durable Object per MCP session). Exposes four practical web/dev tools over Streamable HTTP at `/mcp`.

## Tools

| Tool           | Input                                                        | Returns                             |
| -------------- | ------------------------------------------------------------ | ----------------------------------- |
| `dns_lookup`   | `hostname`, `type` (`A`, `AAAA`, `MX`, `TXT`, `NS`, `CNAME`) | DoH status + answers (via 1.1.1.1)  |
| `http_headers` | `url` (http/https)                                           | Status, final URL, response headers |
| `is_it_up`     | `url` (http/https)                                           | `up`, status, latency in ms         |
| `hash_text`    | `text`, `algorithm` (`SHA-256`, `SHA-384`, `SHA-512`)        | Hex digest                          |

Tool failures return `isError: true` with `{ error, code }` (`INVALID_HOSTNAME`, `INVALID_URL`, `DNS_ERROR`, `FETCH_ERROR`).

## HTTP routes

- **GET /** — App info, MCP endpoint URL, and a ready-to-paste `mcp.json` snippet
- **POST /mcp** — MCP Streamable HTTP endpoint (handled by `ToolsMcp.serve("/mcp")`)

## Connect a client

Cursor (`~/.cursor/mcp.json`) or Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mcp-tools-server": {
      "command": "npx",
      "args": ["mcp-remote", "https://mcp-tools-server.<your-subdomain>.workers.dev/mcp"]
    }
  }
}
```

Or test with the MCP Inspector: `npx @modelcontextprotocol/inspector`, choose **Streamable HTTP**, and enter the `/mcp` URL.

## Run locally

```bash
cd apps/experiments/mcp-tools-server
npm install
npm run dev
# MCP endpoint: http://localhost:8787/mcp
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/mcp-tools-server)

## Cloudflare features used

- Agents SDK (`McpAgent`)
- Durable Objects (SQLite-backed)
- Workers `fetch` + Web Crypto
