#!/usr/bin/env node
/**
 * Normalizes experiment doc section titles and order.
 * Run from repo root: node apps/docs/scripts/normalize-experiment-docs.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DOCS_DIR = join(import.meta.dirname, "../content/docs/experiments");

const RENAME = {
  "API Endpoint": "API Reference",
  "API Endpoints": "API Reference",
  Deploy: "Deployment",
  "Run locally": "Local Development",
  "Cloudflare Features": "Cloudflare Features Used",
  "Cloudflare features used": "Cloudflare Features Used",
  "Related resources": "Next Steps",
  "Related Resources": "Next Steps",
};

const TAIL_ORDER = [
  "Use Cases",
  "Limitations",
  "Deployment",
  "Local Development",
  "Configuration",
  "Cloudflare Features Used",
  "Next Steps",
];

const HEAD_ORDER = ["Features", "API Reference"];

/** Sections merged into Configuration */
const MERGE_INTO_CONFIG = new Set(["Dependencies", "Bindings", "Environment Variables"]);

/** @type {Record<string, string>} */
const FEATURES = {
  "text-similarity": `- Compare two text strings for semantic similarity (score 0–1)
- Workers AI embeddings via \`@cf/baai/bge-base-en-v1.5\`
- Cosine similarity computed at the edge
- Stateless GET API with \`text1\` and \`text2\` query parameters`,

  "sentiment-analyzer": `- Classify text as positive or negative with confidence scores
- Workers AI DistilBERT model at the edge
- Single GET endpoint with a \`text\` query parameter
- No external ML API keys required`,

  "text-translator": `- Translate text between languages using Workers AI
- Machine translation model (\`@cf/meta/m2m100-1.2b\`) at the edge
- Stateless GET API with source text and target language
- No third-party translation service required`,

  "ai-image-generator": `- Generate PNG images from text prompts at the edge
- Workers AI image model (\`@cf/black-forest-labs/flux-1-schnell\`)
- Returns binary image responses directly from the Worker
- No external image API keys required`,
};

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: null, body: raw };
  return { frontmatter: match[1], body: match[2] };
}

function parseSections(body) {
  const parts = body.split(/^## /m);
  return {
    preamble: parts[0].trimEnd(),
    sections: parts.slice(1).map((part) => {
      const nl = part.indexOf("\n");
      const title = part.slice(0, nl).trim();
      const content = part.slice(nl + 1).trimEnd();
      return { title, content };
    }),
  };
}

function canonicalTitle(title) {
  return RENAME[title] ?? title;
}

function splitSetupDeployment(section) {
  return [section];
}

function splitDeploymentWithLocalSteps(section) {
  return [section];
}

function serializeSections(preamble, sections) {
  const body = sections
    .map(({ title, content }) => `## ${title}\n\n${content}`.trimEnd())
    .join("\n\n");
  return preamble ? `${preamble}\n\n${body}\n` : `${body}\n`;
}

function normalizeSections(sections, slug) {
  const expanded = [];
  for (const section of sections) {
    let title = canonicalTitle(section.title);
    if (title === "Setup & Deployment") {
      expanded.push(...splitSetupDeployment({ title: "Deployment", content: section.content }));
      continue;
    }
    if (title === "Deployment") {
      expanded.push(...splitDeploymentWithLocalSteps({ title, content: section.content }));
      continue;
    }
    expanded.push({ title, content: section.content });
  }

  const configParts = [];
  const merged = [];
  for (const section of expanded) {
    if (MERGE_INTO_CONFIG.has(section.title)) {
      configParts.push(`### ${section.title}\n\n${section.content}`);
      continue;
    }
    merged.push(section);
  }

  if (configParts.length) {
    const configIdx = merged.findIndex((s) => s.title === "Configuration");
    if (configIdx >= 0) {
      merged[configIdx].content = `${merged[configIdx].content}\n\n${configParts.join("\n\n")}`.trim();
    } else {
      merged.push({ title: "Configuration", content: configParts.join("\n\n") });
    }
  }

  const byTitle = new Map();
  const middle = [];
  for (const section of merged) {
    const title = section.title;
    if (HEAD_ORDER.includes(title) || TAIL_ORDER.includes(title)) {
      if (!byTitle.has(title)) byTitle.set(title, section);
    } else {
      middle.push(section);
    }
  }

  if (!byTitle.has("Features") && FEATURES[slug]) {
    byTitle.set("Features", { title: "Features", content: FEATURES[slug] });
  }

  const ordered = [];
  for (const title of HEAD_ORDER) {
    if (byTitle.has(title)) ordered.push(byTitle.get(title));
  }
  ordered.push(...middle);
  for (const title of TAIL_ORDER) {
    if (byTitle.has(title)) ordered.push(byTitle.get(title));
  }

  return ordered;
}

function normalizeFile(slug, content) {
  const { frontmatter, body } = parseFrontmatter(content);
  const { preamble, sections } = parseSections(body);
  const normalized = normalizeSections(sections, slug);
  const nextBody = serializeSections(preamble, normalized);
  return frontmatter ? `---\n${frontmatter}\n---\n${nextBody}` : nextBody;
}

const files = readdirSync(DOCS_DIR).filter((f) => f.endsWith(".mdx"));
let updated = 0;

for (const file of files) {
  const slug = file.replace(/\.mdx$/, "");
  const path = join(DOCS_DIR, file);
  const original = readFileSync(path, "utf8");
  const normalized = normalizeFile(slug, original);
  if (normalized !== original) {
    writeFileSync(path, normalized);
    updated += 1;
    console.log(`Updated ${file}`);
  }
}

console.log(`Done. Updated ${updated}/${files.length} experiment docs.`);
