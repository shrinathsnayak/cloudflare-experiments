import { Hono } from "hono";
import type { Env } from "./types/env";
import batchRoutes from "./routes/batch";

const app = new Hono<{ Bindings: Env }>();

app.route("/", batchRoutes);

app.get("/", (c) => {
  return c.json({
    name: "ai-batch-infer",
    description: "Submit Workers AI embedding batches with queueRequest and poll by request_id",
    usage: {
      submit: "POST /batch with JSON { texts: string[] }",
      poll: "GET /batch/:requestId",
    },
    cloudflareFeatures: ["Workers AI", "Asynchronous Batch API"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
