#!/usr/bin/env node
/**
 * Adds icon/tags/bindings frontmatter and converts **`param`** blocks to TypeTable.
 * Icons are loaded from apps/docs/lib/experiment-docs-meta.ts (single source of truth).
 * Run from repo root: node apps/docs/scripts/enhance-experiment-docs.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DOCS_DIR = join(import.meta.dirname, "../content/docs/experiments");
const META_PATH = join(import.meta.dirname, "../lib/experiment-docs-meta.ts");

function loadExperimentDocsMeta() {
  const raw = readFileSync(META_PATH, "utf8");
  const body = raw.slice(raw.indexOf("{"), raw.lastIndexOf("};"));
  const meta = {};

  for (const match of body.matchAll(/(?:"([^"]+)"|(\w+)):\s*\{/g)) {
    const slug = match[1] ?? match[2];
    const start = match.index + match[0].length;
    let depth = 1;
    let i = start;
    while (i < body.length && depth > 0) {
      if (body[i] === "{") depth++;
      else if (body[i] === "}") depth--;
      i++;
    }
    const block = body.slice(start, i - 1);
    const icon = block.match(/icon:\s*"([^"]+)"/)?.[1];
    if (!icon) continue;

    const tagsMatch = block.match(/tags:\s*\[([\s\S]*?)\]/);
    const tags = tagsMatch ? [...tagsMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];

    const bindingsMatch = block.match(/bindings:\s*\[([\s\S]*?)\]/);
    const bindings = bindingsMatch
      ? [...bindingsMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
      : [];

    meta[slug] = { icon, tags, bindings };
  }

  return meta;
}

const META = loadExperimentDocsMeta();

function validateLucideIcons() {
  let lucideIcons;
  try {
    lucideIcons = require("lucide-react").icons;
  } catch {
    return;
  }

  for (const [slug, { icon }] of Object.entries(META)) {
    if (!(icon in lucideIcons)) {
      console.warn(`[enhance-experiment-docs] Invalid Lucide icon "${icon}" for ${slug}`);
    }
  }
}

validateLucideIcons();

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
      if (field.default !== undefined)
        parts.push(`      default: "${escapeJsxString(field.default)}"`);
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

console.log(`Done. Updated ${updated}/${files.length} experiment docs (${Object.keys(META).length} icons loaded).`);
