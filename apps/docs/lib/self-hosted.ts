import { cacheLife } from "next/cache";
import type { TOCItemType } from "fumadocs-core/toc";

export type SelfHostedCategory = {
  id: string;
  name: string;
  order: number;
  summary: string;
};

export type SelfHostedEntry = {
  id: string;
  name: string;
  repo: string;
  category: string;
  license: string;
  licenseNote?: string;
  bindings: string[];
  deploy: boolean;
  popular: boolean;
  summary: string;
};

export type SelfHostedCatalog = {
  source: string;
  syncedAt: string;
  categories: SelfHostedCategory[];
  entries: SelfHostedEntry[];
};

export type SelfHostedGroup = {
  category: SelfHostedCategory;
  entries: SelfHostedEntry[];
};

const REPO = "theoephraim/awesome-cloudflare-selfhosted";
const SOURCE = `https://github.com/${REPO}`;
/**
 * Branch or commit SHA. Prefer a commit SHA in production when you want a
 * pinned supply-chain snapshot; `main` tracks upstream.
 */
const SELF_HOSTED_REF = "main";
const TARBALL = `https://codeload.github.com/${REPO}/tar.gz/${/^[0-9a-f]{40}$/i.test(SELF_HOSTED_REF) ? SELF_HOSTED_REF : `refs/heads/${SELF_HOSTED_REF}`
  }`;
const FETCH_TIMEOUT_MS = 15_000;
const MAX_TARBALL_BYTES = 8 * 1024 * 1024;
const GITHUB_REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const textDecoder = new TextDecoder();

function parseFrontmatter(text: string): Record<string, unknown> {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const data: Record<string, unknown> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;

    const key = trimmed.slice(0, colon).trim();
    let raw = trimmed.slice(colon + 1).trim();

    if (raw === "true") {
      data[key] = true;
      continue;
    }
    if (raw === "false") {
      data[key] = false;
      continue;
    }
    if (/^\d+$/.test(raw)) {
      data[key] = Number(raw);
      continue;
    }
    if (raw.startsWith("[") && raw.endsWith("]")) {
      data[key] = raw
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      continue;
    }
    if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
      raw = raw.slice(1, -1);
    }
    data[key] = raw;
  }
  return data;
}

function readAscii(view: DataView, offset: number, length: number): string {
  let end = offset;
  const max = offset + length;
  while (end < max && view.getUint8(end) !== 0) end += 1;
  return textDecoder.decode(view.buffer.slice(offset, end));
}

function readOctal(view: DataView, offset: number, length: number): number {
  const raw = readAscii(view, offset, length).trim();
  return raw ? Number.parseInt(raw, 8) : 0;
}

function isZeroBlock(block: Uint8Array): boolean {
  for (let i = 0; i < 8; i += 1) {
    if (block[i] !== 0) return false;
  }
  return block.every((byte) => byte === 0);
}

/** Extract text files from a gzipped ustar tarball (GitHub codeload). */
async function extractMarkdownFromTarGz(buffer: ArrayBuffer): Promise<Map<string, string>> {
  const decompressed = await new Response(
    new Blob([buffer]).stream().pipeThrough(new DecompressionStream("gzip"))
  ).arrayBuffer();

  const view = new DataView(decompressed);
  const files = new Map<string, string>();
  let offset = 0;

  while (offset + 512 <= decompressed.byteLength) {
    const header = new Uint8Array(decompressed, offset, 512);
    if (isZeroBlock(header)) break;

    const name = readAscii(view, offset, 100);
    const prefix = readAscii(view, offset + 345, 155);
    const size = readOctal(view, offset + 124, 12);
    const typeFlag = String.fromCharCode(view.getUint8(offset + 156) || 48);
    const fullName = prefix ? `${prefix}/${name}` : name;
    const contentOffset = offset + 512;
    const nextOffset = contentOffset + Math.ceil(size / 512) * 512;

    const isFile = typeFlag === "0" || typeFlag === "\0";
    if (isFile && fullName.endsWith(".md")) {
      const normalized = fullName.replace(/^[^/]+\//, "");
      if (normalized.startsWith("data/categories/") || normalized.startsWith("data/entries/")) {
        files.set(
          normalized,
          textDecoder.decode(decompressed.slice(contentOffset, contentOffset + size))
        );
      }
    }

    offset = nextOffset;
  }

  return files;
}

function sortEntries(entries: SelfHostedEntry[]): SelfHostedEntry[] {
  return entries.sort((a, b) => {
    if (a.popular !== b.popular) return a.popular ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function buildCatalog(files: Map<string, string>): SelfHostedCatalog {
  const categories: SelfHostedCategory[] = [];
  const entries: SelfHostedEntry[] = [];

  for (const [path, text] of files) {
    const file = path.split("/").pop() ?? "";
    const id = file.replace(/\.md$/, "");
    const fm = parseFrontmatter(text);

    if (path.startsWith("data/categories/")) {
      categories.push({
        id,
        name: String(fm.name ?? id),
        order: typeof fm.order === "number" ? fm.order : 999,
        summary: typeof fm.summary === "string" ? fm.summary : "",
      });
      continue;
    }

    if (path.startsWith("data/entries/")) {
      const repo = String(fm.repo ?? "");
      // Skip entries with non-GitHub owner/repo shapes (avoids odd link targets).
      if (!GITHUB_REPO_RE.test(repo)) continue;

      const bindings = Array.isArray(fm.bindings)
        ? fm.bindings.map(String)
        : typeof fm.bindings === "string"
          ? [fm.bindings]
          : [];

      entries.push({
        id,
        name: String(fm.name ?? id),
        repo,
        category: String(fm.category ?? ""),
        license: String(fm.license ?? ""),
        licenseNote: typeof fm.license_note === "string" ? fm.license_note : undefined,
        bindings,
        deploy: fm.deploy === true,
        popular: fm.popular === true,
        summary: typeof fm.summary === "string" ? fm.summary : "",
      });
    }
  }

  categories.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  sortEntries(entries);

  return {
    source: SOURCE,
    syncedAt: new Date().toISOString(),
    categories,
    entries,
  };
}

/**
 * Loads catalog data from the upstream GitHub repo.
 * Cached ~1 day via Next.js `"use cache"` (ISR-style).
 */
export async function getSelfHostedCatalog(): Promise<SelfHostedCatalog> {
  "use cache";
  cacheLife("days");

  const response = await fetch(TARBALL, {
    headers: { Accept: "application/gzip" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch self-hosted catalog (${response.status})`);
  }

  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > MAX_TARBALL_BYTES) {
    throw new Error(`Self-hosted catalog tarball too large (${contentLength} bytes)`);
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > MAX_TARBALL_BYTES) {
    throw new Error(`Self-hosted catalog tarball too large (${buffer.byteLength} bytes)`);
  }

  const files = await extractMarkdownFromTarGz(buffer);
  return buildCatalog(files);
}

export function githubRepoUrl(repo: string): string {
  return `https://github.com/${repo}`;
}

/** Group entries by category with one Map pass (avoids N filter scans). */
export function groupSelfHostedEntries(catalog: SelfHostedCatalog): SelfHostedGroup[] {
  const byCategory = new Map<string, SelfHostedEntry[]>();

  for (const entry of catalog.entries) {
    const list = byCategory.get(entry.category);
    if (list) list.push(entry);
    else byCategory.set(entry.category, [entry]);
  }

  for (const list of byCategory.values()) sortEntries(list);

  const groups: SelfHostedGroup[] = [];
  for (const category of catalog.categories) {
    const entries = byCategory.get(category.id);
    if (!entries || entries.length === 0) continue;
    groups.push({ category, entries });
  }
  return groups;
}

function getSelfHostedCategoryToc(catalog: SelfHostedCatalog): TOCItemType[] {
  // Only categories that render on the page (have at least one entry).
  return groupSelfHostedEntries(catalog).map(({ category }) => ({
    title: category.name,
    url: `#${category.id}`,
    depth: 2,
  }));
}

export function mergeSelfHostedToc(toc: TOCItemType[], catalog: SelfHostedCatalog): TOCItemType[] {
  const categoryToc = getSelfHostedCategoryToc(catalog);
  const refreshIndex = toc.findIndex((item) => item.url === "#how-updates-work");
  if (refreshIndex === -1) {
    const legacyIndex = toc.findIndex((item) => item.url === "#refreshing-the-list");
    if (legacyIndex === -1) return [...categoryToc, ...toc];
    return [...toc.slice(0, legacyIndex), ...categoryToc, ...toc.slice(legacyIndex)];
  }
  return [...toc.slice(0, refreshIndex), ...categoryToc, ...toc.slice(refreshIndex)];
}
