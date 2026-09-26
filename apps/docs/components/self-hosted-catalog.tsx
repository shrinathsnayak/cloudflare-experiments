import type { ReactNode } from "react";
import {
  getSelfHostedCatalog,
  githubRepoUrl,
  groupSelfHostedEntries,
  type SelfHostedCatalog as SelfHostedCatalogData,
  type SelfHostedCategory,
  type SelfHostedEntry,
} from "@/lib/self-hosted";
import { cn } from "@/lib/cn";
import { ExternalLink } from "lucide-react";

function Badge({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "brand" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 font-mono text-[11px] leading-none",
        tone === "muted" &&
          "border-fd-border bg-fd-secondary text-fd-muted-foreground no-underline",
        tone === "brand" && "border-brand/30 bg-brand/10 text-brand no-underline"
      )}
    >
      {children}
    </span>
  );
}

function EntryCard({ entry }: { entry: SelfHostedEntry }) {
  const tags = [
    entry.popular ? { key: "popular", label: "Popular", tone: "brand" as const } : null,
    entry.deploy ? { key: "deploy", label: "1-click deploy", tone: "brand" as const } : null,
    entry.license ? { key: "license", label: entry.license, tone: "muted" as const } : null,
    ...entry.bindings.map((binding) => ({
      key: `binding-${binding}`,
      label: binding,
      tone: "muted" as const,
    })),
  ].filter((tag): tag is { key: string; label: string; tone: "muted" | "brand" } => tag !== null);

  return (
    <a
      href={githubRepoUrl(entry.repo)}
      target="_blank"
      rel="noreferrer"
      className="group flex w-full flex-col rounded-xl border border-fd-border bg-fd-card transition-colors hover:border-brand/50 hover:bg-fd-accent/30"
    >
      <div className="flex w-full flex-col gap-2 p-4">
        <div className="flex w-full items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-fd-foreground no-underline group-hover:text-brand">
              {entry.name}
            </h3>
            <p className="mt-0.5 text-xs text-fd-muted-foreground no-underline">{entry.repo}</p>
          </div>
          <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        {entry.summary ? (
          <p className="w-full text-sm leading-relaxed text-fd-muted-foreground no-underline">
            {entry.summary}
          </p>
        ) : null}
      </div>

      {tags.length > 0 ? (
        <div className="flex w-full flex-wrap gap-1.5 border-t border-fd-border px-4 py-3">
          {tags.map((tag) => (
            <Badge key={tag.key} tone={tag.tone}>
              {tag.label}
            </Badge>
          ))}
        </div>
      ) : null}
    </a>
  );
}

function CategoryGroup({
  category,
  entries,
}: {
  category: SelfHostedCategory;
  entries: SelfHostedEntry[];
}) {
  return (
    <section id={category.id} className="self-hosted-category scroll-mt-24 space-y-3">
      <div className="border-b border-fd-border pb-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-fd-foreground">
            {category.name}
          </h2>
          <p className="text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
            {entries.length} {entries.length === 1 ? "project" : "projects"}
          </p>
        </div>
        {category.summary ? (
          <p className="mt-1 text-sm text-fd-muted-foreground">{category.summary}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-3">
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
}

/** Presentational catalog - pass preloaded data to avoid a second fetch. */
export function SelfHostedCatalogView({ catalog }: { catalog: SelfHostedCatalogData }) {
  const { source, syncedAt } = catalog;
  const groups = groupSelfHostedEntries(catalog);

  const syncedLabel = new Date(syncedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="not-prose space-y-6">
      <p className="text-sm text-fd-muted-foreground">
        Curated from{" "}
        <a href={source} target="_blank" rel="noreferrer" className="text-fd-primary underline">
          awesome-cloudflare-selfhosted
        </a>
        . Data refreshes automatically about once a day (last fetched {syncedLabel}).
      </p>

      <div className="flex flex-col gap-10">
        {groups.map(({ category, entries }) => (
          <CategoryGroup key={category.id} category={category} entries={entries} />
        ))}
      </div>
    </div>
  );
}

/** MDX fallback - fetches once (deduped via React.cache + `"use cache"`). */
export async function SelfHostedCatalog() {
  return <SelfHostedCatalogView catalog={await getSelfHostedCatalog()} />;
}
