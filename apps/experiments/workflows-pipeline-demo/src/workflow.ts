import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import type { Env } from "./types/env";
import type { PipelineParams, PipelineResult } from "./types/workflow";
import { fetchPage } from "./lib/fetch-page";
import { summarizeText } from "./lib/ai";

export class SummaryPipeline extends WorkflowEntrypoint<Env, PipelineParams> {
  async run(event: WorkflowEvent<PipelineParams>, step: WorkflowStep): Promise<PipelineResult> {
    const url = event.payload.url;

    const page = await step.do("fetch url", async () => fetchPage(url));

    await step.sleep("pause before summarize", "3 seconds");

    const summary = await step.do("summarize with workers ai", async () =>
      summarizeText(this.env, page.text, page.title)
    );

    const r2Key = await step.do("store summary in r2", async () => {
      const key = `summaries/${event.instanceId}.json`;
      const payload = {
        url,
        title: page.title,
        summary,
        createdAt: new Date().toISOString(),
      };
      await this.env.SUMMARIES.put(key, JSON.stringify(payload), {
        httpMetadata: { contentType: "application/json" },
      });
      return key;
    });

    return { url, summary, r2Key };
  }
}
