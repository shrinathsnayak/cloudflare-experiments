import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homeCategories } from "@/lib/home-content";
import { source } from "@/lib/source";

/** Docs build cwd is `apps/docs`, so experiments sit one level up. */
const experimentsRoot = join(process.cwd(), "..", "experiments");
const changelogPath = join(process.cwd(), "content", "docs", "changelog.mdx");

/** `wrangler.json` keys that represent a Cloudflare product binding, with display labels. */
const wranglerBindingLabels: Record<string, string> = {
  ai: "Workers AI",
  browser: "Browser Rendering",
  kv_namespaces: "KV",
  durable_objects: "Durable Objects",
  r2_buckets: "R2",
  d1_databases: "D1",
  triggers: "Cron Triggers",
  send_email: "Email",
  containers: "Containers",
  queues: "Queues",
  vectorize: "Vectorize",
  ratelimits: "Rate Limiting",
  analytics_engine_datasets: "Analytics Engine",
  worker_loaders: "Worker Loader",
  pipelines: "Pipelines",
  flagship: "Flagship",
  hyperdrive: "Hyperdrive",
  images: "Images",
  secrets_store_secrets: "Secrets Store",
  placement: "Smart Placement",
  assets: "Static Assets",
  stream: "Stream",
  dispatch_namespaces: "Workers for Platforms",
  workflows: "Workflows",
};

export type CatalogExperiment = {
  slug: string;
  /** Product labels derived from the experiment's `wrangler.json`. */
  bindings: string[];
};

export type CatalogStats = {
  experimentCount: number;
  bindingCount: number;
  categoryCount: number;
  /** Latest `## <date>` heading in the changelog, e.g. "October 1, 2026". */
  lastUpdated: string | null;
};

function readWranglerBindings(slug: string): string[] {
  const file = join(experimentsRoot, slug, "wrangler.json");
  if (!existsSync(file)) return [];
  try {
    const config = JSON.parse(readFileSync(file, "utf8").replace(/^\s*\/\/.*$/gm, "")) as Record<
      string,
      unknown
    >;
    return Object.keys(config)
      .map((key) => wranglerBindingLabels[key])
      .filter((label): label is string => Boolean(label));
  } catch {
    return [];
  }
}

function readExperiments(): CatalogExperiment[] {
  if (existsSync(experimentsRoot)) {
    return readdirSync(experimentsRoot, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() && existsSync(join(experimentsRoot, entry.name, "package.json"))
      )
      .map((entry) => ({ slug: entry.name, bindings: readWranglerBindings(entry.name) }))
      .sort((a, b) => a.slug.localeCompare(b.slug));
  }

  // Docs deployed without the monorepo: fall back to one docs page per experiment.
  return source
    .getPages()
    .filter((page) => page.slugs[0] === "experiments" && page.slugs.length === 2)
    .map((page) => ({ slug: page.slugs[1], bindings: page.data.bindings ?? [] }));
}

function readLastUpdated(): string | null {
  if (!existsSync(changelogPath)) return null;
  const match = readFileSync(changelogPath, "utf8").match(/^##\s+(.+?)\s*$/m);
  return match ? match[1] : null;
}

let experimentsCache: CatalogExperiment[] | undefined;

export function getCatalogExperiments(): CatalogExperiment[] {
  experimentsCache ??= readExperiments();
  return experimentsCache;
}

export function getExperimentBindings(slug: string): string[] {
  return getCatalogExperiments().find((experiment) => experiment.slug === slug)?.bindings ?? [];
}

export function getExperimentCount(): number {
  return getCatalogExperiments().length;
}

export function getCatalogStats(): CatalogStats {
  const experiments = getCatalogExperiments();
  return {
    experimentCount: experiments.length,
    bindingCount: new Set(experiments.flatMap((experiment) => experiment.bindings)).size,
    categoryCount: homeCategories.length,
    lastUpdated: readLastUpdated(),
  };
}
