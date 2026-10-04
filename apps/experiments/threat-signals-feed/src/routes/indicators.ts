import { Hono } from "hono";
import type { Env } from "../types/env";
import { jsonSuccess, jsonError } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/indicators", async (c) => {
  const ACCOUNT_ID = c.env.CLOUDFLARE_ACCOUNT_ID;
  const API_TOKEN = c.env.CLOUDFLARE_API_TOKEN;

  if (!ACCOUNT_ID || !API_TOKEN) {
    return jsonError(
      c,
      "Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN",
      "MISSING_CONFIG",
      500
    );
  }

  const limit = c.req.query("limit") || "10";
  const indicatorType = c.req.query("type");

  try {
    const url = new URL(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/cloudforce-one/v2/threat-signals/indicators`
    );
    url.searchParams.set("per_page", limit);
    if (indicatorType) {
      url.searchParams.set("type", indicatorType);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return jsonError(
        c,
        `Threat Signals API error: ${response.status} ${errorText}`,
        "API_ERROR",
        502
      );
    }

    const data = (await response.json()) as {
      success: boolean;
      result?: {
        indicators: Array<{
          id: string;
          article_id: string;
          article_title: string;
          feed_display_name: string;
          type: string;
          value: string;
        }>;
        pagination: {
          count: number;
          has_more: boolean;
        };
      };
    };

    if (!data.success || !data.result) {
      return jsonError(c, "Threat Signals API returned unsuccessful response", "API_ERROR", 502);
    }

    return jsonSuccess(c, {
      indicators: data.result.indicators,
      count: data.result.pagination.count,
      hasMore: data.result.pagination.has_more,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(c, `Threat Signals error: ${message}`, "API_ERROR", 502);
  }
});

export default app;
