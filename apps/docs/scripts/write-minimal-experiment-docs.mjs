#!/usr/bin/env node
/** @deprecated Use full MDX pages (see d1-sql-playground.mdx). This script writes stubs only. */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const exps = [
  "workflows-pipeline-demo",
  "live-cursor-tracker",
  "queue-job-visualizer",
  "speech-to-text-transcriber",
  "rag-mini-search",
  "ssl-certificate-inspector",
  "multi-pop-latency-map",
  "jwt-inspector",
  "rate-limiter-demo",
  "presigned-r2-upload",
  "do-alarm-scheduler",
];

const titles = {
  "workflows-pipeline-demo": "Workflows Pipeline Demo",
  "live-cursor-tracker": "Live Cursor Tracker",
  "queue-job-visualizer": "Queue Job Visualizer",
  "speech-to-text-transcriber": "Speech to Text Transcriber",
  "rag-mini-search": "RAG Mini Search",
  "ssl-certificate-inspector": "SSL Certificate Inspector",
  "multi-pop-latency-map": "Multi-PoP Latency Map",
  "jwt-inspector": "JWT Inspector",
  "rate-limiter-demo": "Rate Limiter Demo",
  "presigned-r2-upload": "Presigned R2 Upload",
  "do-alarm-scheduler": "DO Alarm Scheduler",
};

for (const name of exps) {
  const readme = readFileSync(join("apps/experiments", name, "README.md"), "utf8");
  const desc =
    readme
      .split("\n")
      .find((line) => line.trim() && !line.startsWith("#"))
      ?.trim() ?? name;
  const deploy = `https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/${name}`;
  const mdx = `---
title: "${titles[name]}"
description: "${desc.replace(/"/g, '\\"').slice(0, 160)}"
---

${desc}

## API Reference

See the experiment README at \`apps/experiments/${name}/README.md\` for endpoints, examples, and error codes.

## Use Cases

- Learn Cloudflare platform patterns demonstrated by this experiment
- Prototype edge-native workflows before production hardening
- Reference implementation for bindings and API design in this repo

## Limitations

- Demo scope only; not production-ready without auth, quotas, and monitoring
- See experiment README for binding setup requirements

## Deployment

<Steps>
  <Step>

### Click the deploy button

    [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](${deploy})

  </Step>
  <Step>

### Configure bindings

    See \`wrangler.json\` and the experiment README for required bindings and secrets.

  </Step>
</Steps>

## Local Development

\`\`\`bash
cd apps/experiments/${name}
npm install
npm run dev
\`\`\`

## Cloudflare Features Used

- **[Workers](https://developers.cloudflare.com/workers/)** - Edge compute runtime
`;
  writeFileSync(join("apps/docs/content/docs/experiments", `${name}.mdx`), mdx);
}

console.log(`Wrote ${exps.length} experiment docs`);
