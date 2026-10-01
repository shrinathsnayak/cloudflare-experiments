export const SERVER_NAME = "mcp-tools-server";
export const SERVER_VERSION = "1.0.0";
export const MCP_PATH = "/mcp";

export const ALLOWED_SCHEMES = ["http:", "https:"] as const;
export const FETCH_TIMEOUT_MS = 10_000;
export const USER_AGENT = "Cloudflare-Experiments-McpToolsServer/1.0";

export const DOH_ENDPOINT = "https://cloudflare-dns.com/dns-query";
export const DNS_RECORD_TYPES = ["A", "AAAA", "MX", "TXT", "NS", "CNAME"] as const;

export const HASH_ALGORITHMS = ["SHA-256", "SHA-384", "SHA-512"] as const;
export const MAX_HASH_INPUT_LENGTH = 100_000;
