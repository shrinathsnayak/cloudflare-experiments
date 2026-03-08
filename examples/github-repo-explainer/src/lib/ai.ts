import { jsonrepair } from "jsonrepair";
import type { Env } from "../types/env";
import type { RepoContent } from "./github";
import type { RepoExplainerResponse } from "../types/repo";
import { AI_MODEL, AI_MAX_TOKENS } from "../constants/defaults";

function ensureString(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function ensureStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((x) => x.trim());
}

/** Extract JSON string from model output that may include markdown or prose. */
function extractJson(raw: string): string {
  let candidate = raw.trim();
  const codeBlockMatch = candidate.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) candidate = codeBlockMatch[1].trim();
  const firstBrace = candidate.indexOf("{");
  if (firstBrace !== -1) candidate = candidate.slice(firstBrace);
  return candidate;
}

export async function explainRepo(env: Env, owner: string, repo: string, content: RepoContent): Promise<RepoExplainerResponse> {
  const context = [
    content.readme ? `## README\n${content.readme}` : "",
    ...content.files.map((f) => `## ${f.path}\n${f.content}`),
  ].filter(Boolean).join("\n\n---\n\n");

  const prompt = `You are a technical explainer. Analyze the following content from the GitHub repo "${owner}/${repo}" (README and key files).

CRITICAL: Your entire response must be exactly one valid JSON object. Do not output any text before or after it. Do not wrap in markdown or code blocks. Do not say "Here is the JSON". Start your response with { and end with }.

Use exactly these keys (all required):

1. "summary": A substantive paragraph (4-6 sentences) describing what the project is, who it's for, and what problem it solves. Mention concrete features or goals from the repo.

2. "mainTechnologies": Array of 5-15 strings: languages, frameworks, runtimes, build tools, and key libraries (e.g. "React", "TypeScript", "Vite", "Tailwind CSS"). Be specific.

3. "howItWorks": Two short paragraphs: (a) architecture or high-level flow (e.g. components, CLI, server, plugins), (b) how a developer runs or builds it (scripts, commands, config). Reference actual scripts from package.json or README when present.

4. "keyFeatures": Array of 5-12 short feature bullets (each one clear sentence or phrase). List real capabilities from the docs/code, not generic claims.

5. "projectStructure": 2-4 sentences describing the repo layout: important directories, where source vs config lives, monorepo or single package, entry points. Base this on the file list and README.

6. "gettingStarted": Step-by-step in 3-6 sentences: install command, any env setup, main run/build command, and link to docs if mentioned. Use exact commands from the repo when available.

7. "notableDependencies": Array of 5-12 strings: important npm/pip/cargo package names or library names the project uses (from package.json, requirements, Cargo.toml, etc.). Use actual names from the files.

8. "useCases": Array of 3-8 short strings describing when to use this project (e.g. "Building admin dashboards", "CLI tool for X"). Be concrete.

Content:\n${context.slice(0, 22000)}`;

  const out = await env.AI.run(AI_MODEL, { prompt, max_tokens: AI_MAX_TOKENS });
  const raw = (out as { response?: string }).response ?? (out as { result?: string }).result ?? "{}";
  const extracted = extractJson(raw);
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(extracted) as Record<string, unknown>;
  } catch {
    try {
      parsed = JSON.parse(jsonrepair(extracted)) as Record<string, unknown>;
    } catch {
      const fallbackSummary = raw.includes('"summary"')
        ? (raw.match(/"summary"\s*:\s*"((?:[^"\\]|\\.)*)"/)?.[1] ?? raw.slice(0, 500))
        : raw.slice(0, 500);
      return {
        summary: fallbackSummary.replace(/\\(.)/g, "$1"),
        mainTechnologies: [],
        howItWorks: "See summary.",
        keyFeatures: [],
        projectStructure: "",
        gettingStarted: "",
        notableDependencies: [],
        useCases: [],
      };
    }
  }
  return {
    summary: ensureString(parsed.summary, "Unable to generate summary."),
    mainTechnologies: ensureStringArray(parsed.mainTechnologies),
    howItWorks: ensureString(parsed.howItWorks, "Unable to generate."),
    keyFeatures: ensureStringArray(parsed.keyFeatures),
    projectStructure: ensureString(parsed.projectStructure, ""),
    gettingStarted: ensureString(parsed.gettingStarted, ""),
    notableDependencies: ensureStringArray(parsed.notableDependencies),
    useCases: ensureStringArray(parsed.useCases),
  };
}
