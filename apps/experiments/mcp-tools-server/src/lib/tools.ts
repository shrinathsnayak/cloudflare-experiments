import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DNS_RECORD_TYPES, HASH_ALGORITHMS, MAX_HASH_INPUT_LENGTH } from "../constants/defaults";
import { toolError, toolResult } from "../utils/mcp";
import { dnsLookup, normalizeHostname } from "./dns";
import { hashText } from "./hash";
import { checkUptime, getHttpHeaders } from "./http";
import { validateUrl } from "./url";

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const;

/** Registers every tool on an MCP server. Works with any SDK v1 `McpServer`. */
export function registerTools(server: McpServer): void {
  server.registerTool(
    "dns_lookup",
    {
      title: "DNS lookup",
      description: "Resolve DNS records for a hostname via Cloudflare DNS-over-HTTPS (1.1.1.1).",
      inputSchema: {
        hostname: z.string().describe("Hostname or URL, e.g. cloudflare.com"),
        type: z.enum(DNS_RECORD_TYPES).default("A").describe("Record type"),
      },
      annotations: READ_ONLY,
    },
    async ({ hostname, type }) => {
      const host = normalizeHostname(hostname);
      if (!host) return toolError("Invalid hostname", "INVALID_HOSTNAME");
      try {
        return toolResult(await dnsLookup(host, type));
      } catch (e) {
        return toolError(e instanceof Error ? e.message : "DNS lookup failed", "DNS_ERROR");
      }
    }
  );

  server.registerTool(
    "http_headers",
    {
      title: "HTTP headers",
      description:
        "Fetch a URL from Cloudflare's edge and return the status code and response headers.",
      inputSchema: { url: z.string().describe("http(s) URL to fetch") },
      annotations: READ_ONLY,
    },
    async ({ url }) => {
      const target = validateUrl(url);
      if (!target) return toolError("Invalid URL (http/https only)", "INVALID_URL");
      try {
        return toolResult(await getHttpHeaders(target));
      } catch (e) {
        return toolError(e instanceof Error ? e.message : "Fetch failed", "FETCH_ERROR");
      }
    }
  );

  server.registerTool(
    "is_it_up",
    {
      title: "Is it up?",
      description: "Check whether a URL is reachable from Cloudflare's edge and measure latency.",
      inputSchema: { url: z.string().describe("http(s) URL to check") },
      annotations: READ_ONLY,
    },
    async ({ url }) => {
      const target = validateUrl(url);
      if (!target) return toolError("Invalid URL (http/https only)", "INVALID_URL");
      return toolResult(await checkUptime(target));
    }
  );

  server.registerTool(
    "hash_text",
    {
      title: "Hash text",
      description: "Hash UTF-8 text with SHA-256, SHA-384, or SHA-512 using Web Crypto.",
      inputSchema: {
        text: z.string().max(MAX_HASH_INPUT_LENGTH).describe("Text to hash"),
        algorithm: z.enum(HASH_ALGORITHMS).default("SHA-256").describe("Hash algorithm"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ text, algorithm }) => toolResult(await hashText(text, algorithm))
  );
}
