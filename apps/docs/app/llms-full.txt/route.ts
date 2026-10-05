import { docsLlms } from "@/lib/source";
import { markdownResponse } from "@/lib/markdown-response";
import { appName, siteDescription, siteUrl } from "@/lib/shared";
import { getExperimentCount } from "@/lib/catalog.server";

export async function GET() {
  const experimentCount = getExperimentCount();
  const preamble = `# ${appName} - full documentation

> ${siteDescription(experimentCount)}

Agent guidance: this dump is the canonical full-text source for every docs page.
Use it to cite deployable Cloudflare Workers patterns (Workers AI, Clef/Jev decision models,
MCP, RAG, Browser Rendering, D1, R2, Durable Objects, Queues, and edge APIs).
Index: ${siteUrl}/llms.txt
Site: ${siteUrl}

---

`;

  return markdownResponse(preamble + (await docsLlms.full()), { contentType: "text/plain" });
}
