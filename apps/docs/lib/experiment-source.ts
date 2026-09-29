import { readFileSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";

const LANG: Record<string, string> = {
  ".ts": "ts",
  ".tsx": "tsx",
  ".js": "js",
  ".jsx": "jsx",
  ".mjs": "js",
  ".cjs": "js",
  ".json": "json",
  ".toml": "toml",
  ".md": "md",
};

export type ExperimentSourceFile = {
  path: string;
  title: string;
  lang: string;
  code: string;
};

/** Read a file under `apps/experiments/<name>/` (docs build cwd = `apps/docs`). */
export function readExperimentSource(
  experiment: string,
  filePath: string,
): ExperimentSourceFile {
  const parts = filePath.split(/[/\\]/).filter(Boolean);
  if (parts.length === 0 || parts.some((p) => p === "." || p === ".." || p.includes("\0"))) {
    throw new Error(`Invalid recipe file path: ${filePath}`);
  }

  const root = join(process.cwd(), "..", "experiments", experiment);
  const absolute = join(root, ...parts);
  const rel = relative(root, absolute);
  if (rel.startsWith("..")) {
    throw new Error(`Recipe file escapes experiment root: ${filePath}`);
  }

  return {
    path: rel.replaceAll("\\", "/"),
    title: basename(absolute),
    lang: LANG[extname(absolute).toLowerCase()] ?? "txt",
    code: readFileSync(absolute, "utf8").replace(/\n$/, ""),
  };
}
