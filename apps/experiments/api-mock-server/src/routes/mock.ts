import { Hono, type Context } from "hono";
import type { Env } from "../types/env";
import { buildMockResponse, getMock, sleep, validateSlug } from "../lib/mock";
import { jsonError } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

const serveMock = async (c: Context<{ Bindings: Env }>) => {
  const slug = validateSlug(c.req.param("slug"));
  if (!slug) {
    return jsonError(c, "Missing or invalid path parameter: slug", "INVALID_SLUG");
  }

  const config = await getMock(c.env.MOCKS, slug);
  if (!config) {
    return jsonError(c, "Mock not found", "NOT_FOUND", 404);
  }

  if (config.method !== c.req.method.toUpperCase()) {
    return jsonError(c, "No matching mock for this method", "NO_MATCH", 404);
  }

  if (config.delayMs) {
    await sleep(config.delayMs);
  }

  return buildMockResponse(config);
};

app.all("/mock/:slug", serveMock);
app.all("/mock/:slug/*", serveMock);

export default app;
