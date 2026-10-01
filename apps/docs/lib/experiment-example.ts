import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type ExampleSnippet = { lang: string; code: string };

export type ExperimentExample = {
  request: ExampleSnippet | null;
  response: ExampleSnippet | null;
  deployUrl: string | null;
  hasLocalDevelopment: boolean;
};

type FencedBlock = ExampleSnippet & { index: number };

const fencedBlockPattern = /```(\w+)?[^\n]*\n([\s\S]*?)```/g;
const requestLangs = new Set(["bash", "sh", "shell"]);
const responseLangs = new Set(["json", "http"]);
const deployUrlPattern = /https:\/\/deploy\.workers\.cloudflare\.com\/\?url=[^\s)"'\]]+/;

/** Short `{ error, code }` bodies document failures, not what a first request returns. */
function isErrorExample(code: string): boolean {
  return /"error"\s*:/.test(code) && /"code"\s*:/.test(code) && code.split("\n").length <= 6;
}

function dedent(code: string): string {
  const lines = code.replace(/\n+$/, "").split("\n");
  const indent = Math.min(
    ...lines.filter((line) => line.trim()).map((line) => line.match(/^\s*/)?.[0].length ?? 0)
  );
  return lines.map((line) => line.slice(indent)).join("\n");
}

/** Pull the first example request, its success response, and the Deploy URL from experiment MDX. */
export function extractExperimentExample(markdown: string): ExperimentExample {
  const blocks: FencedBlock[] = [...markdown.matchAll(fencedBlockPattern)].map((match) => ({
    lang: (match[1] ?? "").toLowerCase(),
    code: dedent(match[2]),
    index: match.index ?? 0,
  }));

  const request =
    blocks.find(
      (block) => requestLangs.has(block.lang) && /\b(curl|wscat|websocat)\b/.test(block.code)
    ) ?? null;
  const response = request
    ? (blocks.find(
      (block) =>
        block.index > request.index &&
        responseLangs.has(block.lang) &&
        !isErrorExample(block.code)
    ) ?? null)
    : null;

  return {
    request: request ? { lang: request.lang, code: request.code } : null,
    response: response ? { lang: response.lang, code: response.code } : null,
    deployUrl: markdown.match(deployUrlPattern)?.[0] ?? null,
    hasLocalDevelopment: /^## Local Development\s*$/m.test(markdown),
  };
}

/** Sync read at build time (docs cwd = `apps/docs`) so pages stay statically prerendered. */
export function readExperimentExample(slug: string): ExperimentExample | null {
  const file = join(process.cwd(), "content", "docs", "experiments", `${slug}.mdx`);
  if (!existsSync(file)) return null;
  return extractExperimentExample(readFileSync(file, "utf8"));
}
