import { Hono } from "hono";
import type { Env } from "./types/env";
import type { JobMessage } from "./types/env";
import jobsRoutes from "./routes/jobs";
import { getJob, updateJobStatus } from "./lib/jobs";
import { MAX_ATTEMPTS } from "./constants/defaults";
import { shouldSimulateFailure, simulateJob } from "./lib/process";

const app = new Hono<{ Bindings: Env }>();

app.route("/", jobsRoutes);

app.get("/", (c) => {
  return c.json({
    name: "queue-job-visualizer",
    description: "Cloudflare Queues job pipeline with KV-backed status and simulated retries",
    usage: {
      create: 'POST /jobs with { "type": "resize|fetch", "target": "..." }',
      status: "GET /jobs/:id",
    },
    cloudflareFeatures: ["Queues", "Workers KV"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<JobMessage>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const job = message.body;
      const existing = await getJob(env, job.id);
      const attempts = (existing?.attempts ?? 0) + 1;

      await updateJobStatus(env, job.id, "processing", { attempts });

      try {
        if (shouldSimulateFailure(`${job.id}:${attempts}`)) {
          throw new Error("Simulated processing failure");
        }
        const result = await simulateJob(job.type, job.target);
        await updateJobStatus(env, job.id, "done", { result });
        message.ack();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Processing failed";
        if (attempts >= MAX_ATTEMPTS) {
          await updateJobStatus(env, job.id, "failed", { error: errorMessage });
          message.ack();
        } else {
          await updateJobStatus(env, job.id, "queued", { error: errorMessage });
          message.retry();
        }
      }
    }
  },
};
