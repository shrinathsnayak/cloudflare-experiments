#!/usr/bin/env node
/**
 * Scaffold apps/docs/content/docs/experiments/<name>.mdx from worker source.
 *
 * Usage (from repo root):
 *   node apps/docs/scripts/scaffold-experiment-doc.mjs <experiment-name>
 *
 * Does not modify meta.json or README - update those manually or via the experiment-docs skill.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../../..");
const docsExperimentsDir = join(repoRoot, "apps/docs/content/docs/experiments");

const experimentName = process.argv[2];
if (!experimentName) {
  console.error("Usage: node apps/docs/scripts/scaffold-experiment-doc.mjs <experiment-name>");
  process.exit(1);
}

const experimentDir = join(repoRoot, "apps/experiments", experimentName);
if (!existsSync(experimentDir)) {
  console.error(`Experiment not found: apps/experiments/${experimentName}`);
  process.exit(1);
}

const outPath = join(docsExperimentsDir, `${experimentName}.mdx`);
if (existsSync(outPath)) {
  console.error(`Doc already exists: ${outPath}`);
  console.error("Delete it first or edit manually for updates.");
  process.exit(1);
}

function read(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

const indexTs = read(join(experimentDir, "src/index.ts"));
const wranglerJson = read(join(experimentDir, "wrangler.json"));
const readme = read(join(experimentDir, "README.md"));

const nameMatch = indexTs.match(/name:\s*["'`]([^"'`]+)["'`]/);
const descMatch = indexTs.match(/description:\s*["'`]([^"'`]+)["'`]/);
const usageMatch = indexTs.match(/usage:\s*["'`]([^"'`]+)["'`]/);

const title =
  nameMatch?.[1]
    ?.split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") ?? experimentName;

const description = descMatch?.[1] ?? "TODO: one-line description from src/index.ts";
const usage = usageMatch?.[1] ?? "GET /";

const usageParts = usage.match(/^(GET|POST|PUT|DELETE|PATCH)\s+(\S+)/i);
const method = usageParts?.[1]?.toUpperCase() ?? "GET";
const path = usageParts?.[2] ?? "/";

const exampleQuery = path.includes("?") ? path : `${path}?url=https://example.com`;
const pathOnly = path.split("?")[0];

const bindings = [];
if (wranglerJson.includes('"ai"') || wranglerJson.includes("[ai]"))
  bindings.push("Workers AI (`AI` binding)");
if (wranglerJson.includes("r2_buckets") || wranglerJson.includes('"R2"')) bindings.push("R2");
if (wranglerJson.includes("d1_databases") || wranglerJson.includes('"DB"')) bindings.push("D1");
if (wranglerJson.includes("kv_namespaces") || wranglerJson.includes('"KV"')) bindings.push("KV");
if (wranglerJson.includes("browser") || wranglerJson.includes("BROWSER"))
  bindings.push("Browser Rendering");

const bindingNotes =
  bindings.length > 0
    ? `Configure bindings: ${bindings.join(", ")}. See wrangler.json and experiment README.`
    : "No additional configuration required.";

const readmeHint = readme
  ? "\n<!-- README.md exists - copy API examples and setup notes from apps/experiments/" +
    experimentName +
    "/README.md -->\n"
  : "";

const deployUrl = `https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/${experimentName}`;

const mdx = `---
title: "${title}"
description: "${description}"
---

${description}

<!-- TODO: Expand intro - what Cloudflare capability this demonstrates -->
${readmeHint}
## API Endpoint

### ${method} ${pathOnly}

<!-- TODO: Describe what this endpoint does -->

**TODO** \`string\` (required)

<!-- TODO: Document each query/body param from src/routes/ -->

#### Example Request

\`\`\`bash
curl "https://your-worker.workers.dev${exampleQuery}"
\`\`\`

#### Success Response

<!-- TODO: Document each response field from src/types/ -->

\`\`\`json
{
  "TODO": "replace with example from README or route handler"
}
\`\`\`

#### Error Response

\`\`\`json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE"
}
\`\`\`

#### Error Codes

<!-- TODO: List codes from jsonError() calls in routes -->

- \`400\` - Invalid input
- \`502\` - Upstream or binding error (if applicable)

## Use Cases

- TODO
- TODO
- TODO

## Deployment

<Steps>
  <Step>

### Click the deploy button

    [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](${deployUrl})

  </Step>

  <Step>

### Deploy

    ${bindingNotes}

  </Step>

  <Step>

### Test your deployment

    \`\`\`bash
    curl "https://your-worker.workers.dev${exampleQuery}"
    \`\`\`

  </Step>
</Steps>

## Local Development

\`\`\`bash
cd apps/experiments/${experimentName}
npm install
npm run dev
\`\`\`

Test locally:

\`\`\`bash
curl "http://localhost:8787${exampleQuery}"
\`\`\`

## Cloudflare Features Used

- **[Workers](https://developers.cloudflare.com/workers/)** - Edge compute runtime
${bindings.map((b) => `- **${b.split(" ")[0]}** - TODO: link to Cloudflare docs`).join("\n")}
`;

writeFileSync(outPath, mdx);
console.log(`Wrote ${outPath}`);
console.log("");
console.log("Next steps:");
console.log(`  1. Replace TODOs using apps/experiments/${experimentName}/src/`);
console.log(`  2. Add "experiments/${experimentName}" to apps/docs/content/docs/meta.json`);
console.log("  3. cd apps/docs && npm run build");
