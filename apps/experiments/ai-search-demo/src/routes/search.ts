import { Hono } from "hono";
import type { Env } from "../types/env";
import { DEFAULT_INSTANCE_NAME } from "../constants/defaults";
import { createAISearchBinding, runSearch, validateQuery } from "../lib/search";
import { jsonError, jsonSuccess } from "../utils/response";

const searchRoutes = new Hono<{ Bindings: Env }>();

searchRoutes.get("/search", async (c) => {
  const query = validateQuery(c.req.query("q"));
  if (!query) {
    return jsonError(c, "Missing or invalid query parameter: q", "INVALID_QUERY");
  }

  const instanceName = c.env.INSTANCE_NAME?.trim() || DEFAULT_INSTANCE_NAME;

  try {
    const search = createAISearchBinding(c.env);
    const result = await runSearch(search, query, instanceName);
    return jsonSuccess(c, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return jsonError(c, message, "SEARCH_ERROR", 502);
  }
});

export default searchRoutes;
