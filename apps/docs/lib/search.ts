import { source } from "@/lib/source";
import { toSearchFilterTags } from "@/lib/search-tags";
import type { SortedResult } from "fumadocs-core/search";
import {
  createFromSource,
  type QueryOptions,
  type SearchAPI,
} from "fumadocs-core/search/server";

type PageSearchMeta = {
  title: string;
  description: string;
  keywords: string;
};

type RankedQueryOptions = QueryOptions & {
  mode?: "full" | "vector";
};

function buildPageSearchMeta(): Map<string, PageSearchMeta> {
  const map = new Map<string, PageSearchMeta>();
  for (const page of source.getPages()) {
    map.set(page.url, {
      title: page.data.title,
      description: page.data.description ?? "",
      keywords: [...(page.data.tags ?? []), ...(page.data.bindings ?? [])].join(" "),
    });
  }
  return map;
}

/** How well `query` matches a single text field (higher is better). */
function fieldMatchScore(query: string, text: string): number {
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase().trim();
  if (!q || !t) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 80;

  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 0;

  const hits = tokens.filter((token) => t.includes(token));
  if (hits.length === tokens.length) return 70;
  if (hits.length > 0) return Math.round(40 * (hits.length / tokens.length));
  return 0;
}

/**
 * Prefer name → description → tags/bindings; body-only matches keep Orama order.
 */
function pageRankScore(query: string, meta: PageSearchMeta): number {
  const title = fieldMatchScore(query, meta.title);
  if (title > 0) return 1000 + title;

  const description = fieldMatchScore(query, meta.description);
  if (description > 0) return 500 + description;

  const keywords = fieldMatchScore(query, meta.keywords);
  if (keywords > 0) return 200 + keywords;

  return 0;
}

function groupSearchResults(results: SortedResult[]): SortedResult[][] {
  const groups: SortedResult[][] = [];
  let current: SortedResult[] = [];

  for (const item of results) {
    if (item.type === "page") {
      if (current.length > 0) groups.push(current);
      current = [item];
      continue;
    }
    if (current.length === 0) {
      current = [item];
      continue;
    }
    current.push(item);
  }

  if (current.length > 0) groups.push(current);
  return groups;
}

export function rankSearchResults(query: string, results: SortedResult[]): SortedResult[] {
  const trimmed = query.trim();
  if (!trimmed || results.length === 0) return results;

  const metaByUrl = buildPageSearchMeta();
  const ranked = groupSearchResults(results).map((group, index) => {
    const pageHit = group.find((item) => item.type === "page") ?? group[0];
    const pathname = pageHit.url.split("#")[0] ?? pageHit.url;
    const meta = metaByUrl.get(pathname);
    const score = meta ? pageRankScore(trimmed, meta) : 0;
    return { group, index, score };
  });

  ranked.sort((a, b) => b.score - a.score || a.index - b.index);
  return ranked.flatMap((entry) => entry.group);
}

const engine = createFromSource(source, {
  language: "english",
  buildIndex(page) {
    const tags = toSearchFilterTags(page.data.tags ?? []);
    const keywords = [...(page.data.tags ?? []), ...(page.data.bindings ?? [])];
    // Index tags/bindings as searchable text (ranking still uses clean description).
    const description = [page.data.description, ...keywords].filter(Boolean).join("\n");

    return {
      title: page.data.title,
      description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
      tag: tags.length > 0 ? tags : undefined,
    };
  },
});

async function search(query: string, options?: RankedQueryOptions) {
  const results = await engine.search(query, options);
  return rankSearchResults(query, results);
}

async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  if (!query) return Response.json([]);

  const limitParam = url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : undefined;

  return Response.json(
    await search(query, {
      tag: url.searchParams.get("tag")?.split(","),
      locale: url.searchParams.get("locale") ?? undefined,
      limit: Number.isInteger(limitParam) ? limitParam : undefined,
      mode: url.searchParams.get("mode") === "vector" ? "vector" : "full",
    }),
  );
}

export const docsSearch: SearchAPI<RankedQueryOptions> = {
  search,
  export: () => engine.export(),
  GET,
  staticGET: () => engine.staticGET(),
};
