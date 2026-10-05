import { Hono } from "hono";
import type { Env } from "../types/env";
import { searchWeb, type SearchProvider } from "../lib/search";
import { jsonSuccess, jsonError } from "../utils/response";

interface SearchRequest {
  query: string;
  provider?: SearchProvider;
  limit?: number;
}

const app = new Hono<{ Bindings: Env }>();

app.post("/search", async (c) => {
  let body: SearchRequest;

  try {
    body = await c.req.json();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_JSON", 400);
  }

  const { query, provider = "ceramic", limit = 5 } = body;

  if (!query || typeof query !== "string" || query.trim() === "") {
    return jsonError(c, "Missing or invalid required field: query", "INVALID_REQUEST", 400);
  }

  if (!["ceramic", "exa", "linkup"].includes(provider)) {
    return jsonError(
      c,
      "Invalid provider. Must be one of: ceramic, exa, linkup",
      "INVALID_PROVIDER",
      400
    );
  }

  try {
    const accountId = c.env.AI_GATEWAY_ACCOUNT_ID || "demo";
    const gatewayId = c.env.AI_GATEWAY_ID || "web-search-demo";

    const results = await searchWeb({
      query,
      provider,
      limit,
      accountId,
      gatewayId,
    });

    return jsonSuccess(c, {
      query,
      provider,
      limit,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(c, `Search error: ${message}`, "SEARCH_ERROR", 502);
  }
});

export default app;
