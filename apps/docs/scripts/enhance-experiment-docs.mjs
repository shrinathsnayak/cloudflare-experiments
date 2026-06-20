#!/usr/bin/env node
/**
 * Adds icon/tags/bindings frontmatter and converts **`param`** blocks to TypeTable.
 * Run from repo root: node apps/docs/scripts/enhance-experiment-docs.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DOCS_DIR = join(import.meta.dirname, "../content/docs/experiments");

const META = {
  "ai-website-summary": { icon: "Sparkles", tags: ["ai", "workers-ai"], bindings: ["AI"] },
  "ai-website-tag-generator": { icon: "Tags", tags: ["ai", "workers-ai"], bindings: ["AI"] },
  "github-repo-explainer": { icon: "GitBranch", tags: ["ai", "workers-ai"], bindings: ["AI"] },
  "ai-bot-visibility": { icon: "Bot", tags: ["ai", "seo"], bindings: [] },
  "cloud-ai-proxy": { icon: "Cpu", tags: ["ai", "workers-ai"], bindings: ["AI"] },
  "text-translator": { icon: "Languages", tags: ["ai", "workers-ai"], bindings: ["AI"] },
  "sentiment-analyzer": { icon: "Smile", tags: ["ai", "workers-ai"], bindings: ["AI"] },
  "text-similarity": { icon: "GitCompareArrows", tags: ["ai", "embeddings"], bindings: ["AI"] },
  "ai-image-generator": { icon: "Image", tags: ["ai", "workers-ai"], bindings: ["AI"] },
  "website-metadata-extractor": { icon: "FileSearch", tags: ["scraping"], bindings: [] },
  "website-to-api": { icon: "Code", tags: ["scraping"], bindings: [] },
  "website-to-llms-txt": { icon: "FileText", tags: ["scraping"], bindings: [] },
  "website-devtools-inspector": { icon: "Search", tags: ["scraping"], bindings: ["BROWSER"] },
  "dependency-analyzer": { icon: "Package", tags: ["scraping"], bindings: [] },
  "html-rewriter": { icon: "FileCode", tags: ["scraping"], bindings: [] },
  "screenshot-api": { icon: "Camera", tags: ["browser"], bindings: ["BROWSER"] },
  "pdf-api": { icon: "FileType", tags: ["browser"], bindings: ["BROWSER"] },
  "page-metrics": { icon: "Gauge", tags: ["browser"], bindings: ["BROWSER"] },
  "rendered-text": { icon: "FileText", tags: ["browser"], bindings: ["BROWSER"] },
  "browser-links": { icon: "Link", tags: ["browser"], bindings: ["BROWSER"] },
  "is-it-down": { icon: "Activity", tags: ["network"], bindings: [] },
  "url-dns-lookup": { icon: "Globe", tags: ["network"], bindings: [] },
  "edge-redirect-simulator": { icon: "Route", tags: ["network"], bindings: [] },
  "whereami": { icon: "MapPin", tags: ["network"], bindings: [] },
  "response-headers": { icon: "List", tags: ["network"], bindings: [] },
  "edge-cache": { icon: "Database", tags: ["edge"], bindings: [] },
  "crypto-hash": { icon: "Hash", tags: ["edge"], bindings: [] },
  "websocket-echo": { icon: "Radio", tags: ["edge"], bindings: [] },
  "image-resizer": { icon: "ImageDown", tags: ["edge"], bindings: [] },
  "turnstile-verify": { icon: "ShieldCheck", tags: ["edge"], bindings: [] },
  "r2-storage": { icon: "HardDrive", tags: ["storage"], bindings: ["R2"] },
  "link-shortener": { icon: "Link2", tags: ["storage"], bindings: ["D1", "KV"] },
  "kv-notes": { icon: "StickyNote", tags: ["storage"], bindings: ["KV"] },
  "vectorize-search": { icon: "Search", tags: ["storage", "ai"], bindings: ["AI", "VECTORIZE"] },
  "durable-counter": { icon: "Hash", tags: ["stateful"], bindings: ["DO"] },
  "cron-heartbeat": { icon: "Clock", tags: ["stateful"], bindings: ["KV"] },
  "task-queue": { icon: "ListOrdered", tags: ["stateful"], bindings: ["QUEUE", "KV"] },
  "analytics-engine": { icon: "ChartBar", tags: ["stateful"], bindings: ["ANALYTICS"] },
};

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw };
  const frontmatter = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) frontmatter[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  return { frontmatter, body: match[2] };
}

function serializeFrontmatter(data) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) lines.push(`  - ${item}`);
    } else if (typeof value === "boolean") {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: "${value}"`);
    }
  }
  lines.push("---", "");
  return lines.join("\n");
}

function escapeJsxString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildTypeTable(fields) {
  if (Object.keys(fields).length === 0) return "";

  const entries = Object.entries(fields)
    .map(([name, field]) => {
      const parts = [
        `      description: "${escapeJsxString(field.description)}"`,
        `      type: "${field.type}"`,
      ];
      if (field.required) parts.push("      required: true");
      if (field.default !== undefined) parts.push(`      default: "${escapeJsxString(field.default)}"`);
      return `    ${name}: {\n${parts.join(",\n")},\n    }`;
    })
    .join(",\n");

  return `<TypeTable\n  type={{\n${entries}\n  }}\n/>\n\n`;
}

function parseFieldBlocks(text) {
  const fields = {};
  const regex =
    /\*\*`([^`]+)`\*\* `([^`]+)` \((required|optional)\)\s*\n\s*\n([\s\S]*?)(?=\n\*\*`[^`]+`\*\* `|\n####|\n##|\n```|\n<TypeTable|\n<Steps|\n<Callout|$)/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const [, name, type, requiredFlag, descriptionRaw] = match;
    if (fields[name]) continue;
    const description = descriptionRaw.trim().replace(/\n+/g, " ");
    if (!description) continue;
    fields[name] = {
      type,
      description,
      required: requiredFlag === "required",
    };
  }

  return fields;
}

function replaceFieldBlocks(text) {
  if (text.includes("<TypeTable")) return text;

  const firstField = text.search(/\*\*`[^`]+`\*\* `[^`]+` \((required|optional)\)/);
  if (firstField === -1) return text;

  const endMatch = text.slice(firstField).search(/\n#### |\n## |\n```|\n<Steps|\n<Callout/);
  const end = endMatch === -1 ? text.length : firstField + endMatch;
  const requestFields = parseFieldBlocks(text.slice(firstField, end));
  if (Object.keys(requestFields).length === 0) return text;

  const before = text.slice(0, firstField);
  const after = text.slice(end).replace(/^\n+/, "\n");

  return `${before}${buildTypeTable(requestFields)}${after}`;
}

function enhanceBody(body) {
  return body
    .split(/(?=### (?:GET|POST|PUT|DELETE|PATCH) \/)/)
    .map((section, index) => (index === 0 ? section : replaceFieldBlocks(section)))
    .join("");
}

function enhanceFile(slug, content) {
  const meta = META[slug];
  if (!meta) {
    console.warn(`No metadata for ${slug}, skipping frontmatter`);
    return content;
  }

  const { frontmatter, body } = parseFrontmatter(content);
  const nextFrontmatter = {
    title: frontmatter.title ?? slug,
    description: frontmatter.description ?? "",
    icon: meta.icon,
    tags: meta.tags,
    ...(meta.bindings.length > 0 ? { bindings: meta.bindings } : {}),
    ...(frontmatter.full === "true" || frontmatter.full === true ? { full: true } : {}),
  };

  const nextBody = enhanceBody(body);
  return serializeFrontmatter(nextFrontmatter) + "\n" + nextBody.trimStart();
}

const files = readdirSync(DOCS_DIR).filter((file) => file.endsWith(".mdx"));
let updated = 0;

for (const file of files) {
  const slug = file.replace(/\.mdx$/, "");
  const path = join(DOCS_DIR, file);
  const original = readFileSync(path, "utf8");
  const enhanced = enhanceFile(slug, original);
  if (enhanced !== original) {
    writeFileSync(path, enhanced);
    updated += 1;
    console.log(`Updated ${file}`);
  }
}

console.log(`Done. Updated ${updated}/${files.length} experiment docs.`);
