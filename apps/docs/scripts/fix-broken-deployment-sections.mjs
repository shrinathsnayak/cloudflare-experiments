#!/usr/bin/env node
/** Fixes Deployment/Local Development sections broken by normalize-experiment-docs.mjs */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DOCS_DIR = join(import.meta.dirname, "../content/docs/experiments");

/** @type {Record<string, { deployment: string; localDev: string; configuration: string }>} */
const FIXES = {
  "ai-website-summary.mdx": {
    deployment: `## Deployment

<Steps>
  <Step>

### Click the deploy button

    [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ai-website-summary)

  </Step>

  <Step>

### Deploy

    Enable the **Workers AI** binding (\`AI\`) in your Worker settings. The deploy button configures this automatically via \`wrangler.json\`. Requires a Cloudflare account with Workers AI enabled.

  </Step>

  <Step>

### Test your deployment

    \`\`\`bash
    curl "https://your-worker.workers.dev/summary?url=https://www.cloudflare.com"
    \`\`\`

  </Step>
</Steps>`,
    localDev: `## Local Development

\`\`\`bash
cd apps/experiments/ai-website-summary
npm install
npm run dev
\`\`\`

Test locally:

\`\`\`bash
curl "http://localhost:8787/summary?url=https://www.cloudflare.com"
\`\`\``,
    configuration: `## Configuration

The Worker automatically binds to Workers AI. The \`wrangler.json\` configuration includes:

\`\`\`json
{
  "name": "ai-website-summary",
  "main": "src/index.ts",
  "compatibility_date": "2024-01-01",
  "ai": { "binding": "AI" }
}
\`\`\`

No additional environment variables or secrets are required.

### Dependencies

\`\`\`json
{
  "dependencies": {
    "hono": "^4.6.12"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20241127.0",
    "typescript": "^5.7.2",
    "wrangler": "^4"
  }
}
\`\`\``,
  },

  "github-repo-explainer.mdx": {
    deployment: `## Deployment

<Steps>
  <Step>

### Click the deploy button

    [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/github-repo-explainer)

  </Step>

  <Step>

### Deploy

    Enable the **Workers AI** binding (\`AI\`) in your Worker settings. The deploy button configures this automatically via \`wrangler.json\`. Requires a Cloudflare account with Workers AI enabled.

  </Step>

  <Step>

### Test your deployment

    \`\`\`bash
    curl "https://your-worker.workers.dev/repo?url=https://github.com/cloudflare/workers-sdk"
    \`\`\`

  </Step>
</Steps>`,
    localDev: `## Local Development

\`\`\`bash
cd apps/experiments/github-repo-explainer
npm install
npm run dev
\`\`\`

Test locally:

\`\`\`bash
curl "http://localhost:8787/repo?url=https://github.com/cloudflare/workers-sdk"
\`\`\``,
    configuration: `## Configuration

The Worker automatically binds to Workers AI. The \`wrangler.json\` configuration includes:

\`\`\`json
{
  "name": "github-repo-explainer",
  "main": "src/index.ts",
  "compatibility_date": "2024-01-01",
  "ai": { "binding": "AI" }
}
\`\`\`

No additional environment variables or secrets are required. GitHub API is used without authentication (subject to rate limits).

### Dependencies

\`\`\`json
{
  "dependencies": {
    "hono": "^4.6.12",
    "jsonrepair": "^3.13.2"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20241127.0",
    "typescript": "^5.7.2",
    "wrangler": "^4"
  }
}
\`\`\`

The \`jsonrepair\` package helps handle malformed JSON responses from the AI model.`,
  },

  "ai-bot-visibility.mdx": {
    deployment: `## Deployment

<Steps>
  <Step>

### Click the deploy button

    [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ai-bot-visibility)

  </Step>

  <Step>

### Deploy

    Follow the deployment wizard to deploy the Worker to your Cloudflare account. No additional configuration or bindings required.

  </Step>

  <Step>

### Test your deployment

    \`\`\`bash
    curl "https://your-worker.workers.dev/check?url=https://www.cloudflare.com"
    \`\`\`

  </Step>
</Steps>`,
    localDev: `## Local Development

\`\`\`bash
cd apps/experiments/ai-bot-visibility
npm install
npm run dev
\`\`\`

Test locally:

\`\`\`bash
curl "http://localhost:8787/check?url=https://www.cloudflare.com"
\`\`\``,
    configuration: `## Configuration

No bindings or environment variables are required. The \`wrangler.json\` is minimal:

\`\`\`json
{
  "name": "ai-bot-visibility",
  "main": "src/index.ts",
  "compatibility_date": "2024-01-01"
}
\`\`\`

### Dependencies

\`\`\`json
{
  "dependencies": {
    "hono": "^4.6.12"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20241127.0",
    "typescript": "^5.7.2",
    "wrangler": "^4"
  }
}
\`\`\``,
  },

  "ai-website-tag-generator.mdx": {
    deployment: `## Deployment

<Steps>
  <Step>

### Click the deploy button

    [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ai-website-tag-generator)

  </Step>

  <Step>

### Deploy

    Enable the **Workers AI** binding (\`AI\`) in your Worker settings. The deploy button configures this automatically via \`wrangler.json\`. Requires a Cloudflare account with Workers AI enabled.

  </Step>

  <Step>

### Test your deployment

    \`\`\`bash
    curl "https://your-worker.workers.dev/tags?url=https://www.cloudflare.com"
    \`\`\`

  </Step>
</Steps>`,
    localDev: `## Local Development

\`\`\`bash
cd apps/experiments/ai-website-tag-generator
npm install
npm run dev
\`\`\`

Test locally:

\`\`\`bash
curl "http://localhost:8787/tags?url=https://www.cloudflare.com"
\`\`\``,
    configuration: "",
  },
};

function fixFile(file, { deployment, localDev, configuration }) {
  const path = join(DOCS_DIR, file);
  let content = readFileSync(path, "utf8");

  const start = content.indexOf("\n## Deployment\n");
  const end = content.indexOf("\n## Cloudflare Features Used\n");
  if (start === -1 || end === -1) {
    console.warn(`Could not fix ${file}`);
    return false;
  }

  const replacement = [deployment, localDev, configuration].filter(Boolean).join("\n\n");
  content = content.slice(0, start + 1) + replacement + content.slice(end);
  writeFileSync(path, content);
  return true;
}

for (const [file, sections] of Object.entries(FIXES)) {
  if (fixFile(file, sections)) console.log(`Fixed ${file}`);
}
