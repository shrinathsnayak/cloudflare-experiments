import { Hono } from "hono";
import type { Env } from "./types/env";
import runRoutes from "./routes/run";

const app = new Hono<{ Bindings: Env }>();

app.route("/", runRoutes);

app.get("/", (c) => {
  return c.json({
    name: "dynamic-worker-runner",
    description:
      "Execute untrusted JavaScript via Dynamic Workers (Worker Loader API) with no network access",
    usage: {
      run: "POST /run with { code: string } — code must export default { async fetch() { ... } }",
      exampleCode: 'export default { async fetch() { return Response.json({ hello: "world" }); } }',
    },
    cloudflareFeatures: ["Dynamic Workers", "Worker Loader"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
