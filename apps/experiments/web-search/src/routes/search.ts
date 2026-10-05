import { Hono } from "hono";
import type { Env } from "../types/env";
import { jsonSuccess, jsonError } from "../utils/response";

interface SearchRequest {
  query: string;
  provider?: "ceramic" | "exa" | "linkup";
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

    const gatewayUrl = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/web-search/${provider}`;

    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return jsonError(
        c,
        `Web Search API error: ${response.status} ${errorText}`,
        "SEARCH_ERROR",
        502
      );
    }

    const data = await response.json();

    return jsonSuccess(c, {
      query,
      provider,
      limit,
      results: data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(c, `Search error: ${message}`, "SEARCH_ERROR", 502);
  }
});

export default app;
