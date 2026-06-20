import { GITHUB_API_BASE, FETCH_TIMEOUT_MS, MAX_CONTENT_CHARS } from "../constants/defaults";

export function parseRepoUrl(input: string): { owner: string; repo: string } | null {
  const trimmed = (input || "").trim();
  const match =
    trimmed.match(/github\.com[/]([^/]+)[/]([^/]+?)(?:\.git)?[/]?$/i) ||
    trimmed.match(/^([^/]+)[/]([^/]+)$/);
  if (!match) return null;
  const owner = match[1].replace(/\.git$/, "");
  const repo = match[2].replace(/\.git$/, "");
  return owner && repo ? { owner, repo } : null;
}

const COMMON_HEADERS = {
  "User-Agent": "Cloudflare-Experiments-GithubRepoExplainer/1.0",
};

async function fetchApi(path: string, raw = true): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const url = `${GITHUB_API_BASE}${path}`;
  const res = await fetch(url, {
    signal: controller.signal,
    headers: {
      Accept: raw ? "application/vnd.github.raw+json" : "application/vnd.github.v3+json",
      ...COMMON_HEADERS,
    },
  });
  clearTimeout(timeoutId);
  return res;
}

export interface RepoContent {
  readme: string;
  files: { path: string; content: string }[];
}

export async function fetchRepoContent(owner: string, repo: string): Promise<RepoContent> {
  const readmeRes = await fetchApi(`/repos/${owner}/${repo}/readme`);
  let readme = "";
  if (readmeRes.ok) {
    const text = await readmeRes.text();
    readme = text.length > MAX_CONTENT_CHARS ? text.slice(0, MAX_CONTENT_CHARS) + "\n..." : text;
  }

  const treeRes = await fetchApi(`/repos/${owner}/${repo}/contents/`, false);
  if (!treeRes.ok) return { readme, files: [] };

  const priorityNames = [
    "package.json",
    "package-lock.json",
    "Cargo.toml",
    "pyproject.toml",
    "go.mod",
    "tsconfig.json",
    "vite.config.ts",
    "vite.config.js",
    "next.config.js",
    "next.config.mjs",
  ];
  const tree = (await treeRes.json()) as Array<{ name: string; type: string }>;
  const allFiles = tree.filter((f) => f.type === "file");
  const sorted = [...allFiles].sort((a, b) => {
    const ai = priorityNames.indexOf(a.name);
    const bi = priorityNames.indexOf(b.name);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return 0;
  });
  const topFiles = sorted.slice(0, 12);
  const files: { path: string; content: string }[] = [];

  for (const f of topFiles) {
    const fileRes = await fetchApi(`/repos/${owner}/${repo}/contents/${f.name}`);
    if (!fileRes.ok) continue;
    const text = await fileRes.text();
    const content = text.length > 4000 ? text.slice(0, 4000) + "\n..." : text;
    files.push({ path: f.name, content });
  }

  return { readme, files };
}
