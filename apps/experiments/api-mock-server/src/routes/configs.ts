import { Hono } from "hono";
import type { Env } from "../types/env";
import type { CreateMockRequest } from "../types/mock";
import {
  deleteMock,
  generateSlug,
  getMock,
  listMocks,
  saveMock,
  validateCreateMockRequest,
  validateSlug,
} from "../lib/mock";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/configs", async (c) => {
  const mocks = await listMocks(c.env.MOCKS);
  return jsonSuccess(c, { mocks });
});

app.post("/configs", async (c) => {
  let body: CreateMockRequest;
  try {
    body = await c.req.json<CreateMockRequest>();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_BODY");
  }

  const validated = validateCreateMockRequest(body);
  if (!validated) {
    return jsonError(
      c,
      "Invalid mock config: path must start with /, method must be a valid HTTP verb, status must be 100-599, body must be JSON-serializable, delayMs must be 0-30000",
      "INVALID_CONFIG"
    );
  }

  const slug = generateSlug();
  const config = {
    slug,
    ...validated,
    createdAt: new Date().toISOString(),
  };

  await saveMock(c.env.MOCKS, config);
  return jsonSuccess(c, { slug, ...validated, createdAt: config.createdAt }, 200);
});

app.delete("/configs/:slug", async (c) => {
  const slug = validateSlug(c.req.param("slug"));
  if (!slug) {
    return jsonError(c, "Missing or invalid path parameter: slug", "INVALID_SLUG");
  }

  const existing = await getMock(c.env.MOCKS, slug);
  if (!existing) {
    return jsonError(c, "Mock not found", "NOT_FOUND", 404);
  }

  await deleteMock(c.env.MOCKS, slug);
  return jsonSuccess(c, { slug, deleted: true });
});

export default app;
