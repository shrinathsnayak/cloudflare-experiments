import { Hono } from "hono";
import type { Env } from "../types/env";
import { parseRepoUrl, fetchRepoContent } from "../lib/github";
import { explainRepo } from "../lib/ai";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/repo", async (c) => {
  const urlParam = c.req.query("url");
  if (!urlParam?.trim()) return jsonError(c, "Missing query parameter: url", "INVALID_URL");

  const parsed = parseRepoUrl(urlParam);
  if (!parsed) return jsonError(c, "Invalid GitHub repo URL", "INVALID_URL");

  try {
    const content = await fetchRepoContent(parsed.owner, parsed.repo);
    const result = await explainRepo(c.env, parsed.owner, parsed.repo, content);
    return jsonSuccess(c, result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch or explain repo";
    return jsonError(c, message, "FETCH_OR_AI_ERROR", 502);
  }
});

export default app;
