/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 */
import { searchWeb } from "../src/lib/search";

export default {
  async fetch(
    request: Request,
    env: { AI_GATEWAY_ACCOUNT_ID?: string; AI_GATEWAY_ID?: string }
  ): Promise<Response> {
    if (request.method !== "POST") {
      return Response.json(
        { error: "Method not allowed", code: "METHOD_NOT_ALLOWED" },
        { status: 405 }
      );
    }

    const body = (await request.json()) as {
      query?: string;
      provider?: "ceramic" | "exa" | "linkup";
      limit?: number;
    };

    if (!body.query?.trim()) {
      return Response.json({ error: "Missing query", code: "INVALID_REQUEST" }, { status: 400 });
    }

    const results = await searchWeb({
      query: body.query,
      provider: body.provider,
      limit: body.limit,
      accountId: env.AI_GATEWAY_ACCOUNT_ID || "demo",
      gatewayId: env.AI_GATEWAY_ID || "web-search-demo",
    });

    return Response.json({
      query: body.query,
      provider: body.provider ?? "ceramic",
      limit: body.limit ?? 5,
      results,
    });
  },
};
