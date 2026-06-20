#!/usr/bin/env node
/**
 * Moves Use Cases and Limitations to immediately before Deployment.
 * Run from repo root: node apps/docs/scripts/move-use-cases-limitations.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DOCS_DIR = join(import.meta.dirname, "../content/docs/experiments");

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: "", body: raw };
  return { frontmatter: match[1], body: match[2] };
}

function extractSection(body, title) {
  const re = new RegExp(`^## ${title}$`, "m");
  const match = body.match(re);
  if (!match || match.index === undefined) return null;

  const start = match.index;
  const after = body.slice(start + match[0].length);
  const nextIdx = after.search(/\n## /);
  const end = nextIdx === -1 ? body.length : start + match[0].length + nextIdx;

  return { start, end, text: body.slice(start, end).trim() };
}

function moveSectionsBeforeDeployment(content) {
  const { frontmatter, body } = parseFrontmatter(content);
  const useCases = extractSection(body, "Use Cases");
  const limitations = extractSection(body, "Limitations");
  const deployment = extractSection(body, "Deployment");

  if (!useCases && !limitations) return content;
  if (!deployment) {
    console.warn("Skipping: no ## Deployment section found");
    return content;
  }

  const removals = [useCases, limitations].filter(Boolean).sort((a, b) => b.start - a.start);
  let newBody = body;
  for (const section of removals) {
    newBody = newBody.slice(0, section.start) + newBody.slice(section.end);
  }
  newBody = newBody.replace(/\n{3,}/g, "\n\n");

  const deploymentMatch = newBody.match(/^## Deployment$/m);
  if (!deploymentMatch || deploymentMatch.index === undefined) return content;

  const insertBlock = [useCases?.text, limitations?.text].filter(Boolean).join("\n\n");
  const before = newBody.slice(0, deploymentMatch.index).trimEnd();
  const after = newBody.slice(deploymentMatch.index);

  newBody = `${before}\n\n${insertBlock}\n\n${after}\n`;

  return frontmatter ? `---\n${frontmatter}\n---\n${newBody}` : newBody;
}

const files = readdirSync(DOCS_DIR).filter((file) => file.endsWith(".mdx"));
let updated = 0;

for (const file of files) {
  const path = join(DOCS_DIR, file);
  const original = readFileSync(path, "utf8");
  const moved = moveSectionsBeforeDeployment(original);
  if (moved !== original) {
    writeFileSync(path, moved);
    updated += 1;
    console.log(`Updated ${file}`);
  }
}

console.log(`Done. Updated ${updated}/${files.length} experiment docs.`);
