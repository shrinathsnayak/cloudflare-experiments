import { Hono } from "hono";
import type { Env } from "../types/env";
import type { RedirectChainResponse } from "../types/redirect-chain";
import { validateUrl } from "../lib/url";
import { getRedirectChain } from "../lib/redirect-chain";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/redirect-chain", async (c) => {
  const urlParam = c.req.query("url");
  const url = validateUrl(urlParam);
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  const { chain, error } = await getRedirectChain(url);
  const response: RedirectChainResponse & { error?: string } = { chain };
  if (error) response.error = error;

  return jsonSuccess(c, response);
});

export default app;
