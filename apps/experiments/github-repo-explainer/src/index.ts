import { Hono } from "hono";
import type { Env } from "./types/env";
import repoRoutes from "./routes/repo";

const app = new Hono<{ Bindings: Env }>();

app.route("/", repoRoutes);

app.get("/", (c) => {
  return c.json({
    name: "github-repo-explainer",
    description: "AI explanation of any GitHub repository from README and key files",
    usage: "GET /repo?url=https://github.com/user/project",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
