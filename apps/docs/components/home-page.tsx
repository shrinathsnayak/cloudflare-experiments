import {
  docLinks,
  featuredExperiments,
  homeCategories,
  homePrinciples,
  homeWorkflow,
  maxFeaturedNewBadges,
  type HomeCategory,
  type HomeDocLink,
  type HomeExperiment,
} from "@/lib/home-content";
import { getCatalogStats, getExperimentBindings } from "@/lib/catalog.server";
import { HeroBackdrop, HeroReveal } from "@/components/hero-motion";
import { SidebarStatusBadge } from "@/components/sidebar-status-badge";
import {
  docsRoute,
  experimentDeployUrl,
  experimentsIndexRoute,
  gitConfig,
  githubCloneUrl,
  githubRepoUrl,
  heroDescription,
  heroTitle,
} from "@/lib/shared";
import { ArrowRight, CheckCircle2, GitBranch, LayoutGrid, Rocket, Terminal } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const homeInteractiveCardClass =
  "group flex min-w-0 flex-col rounded-xl border border-fd-border bg-fd-background p-4 transition-colors hover:border-brand/40 hover:bg-fd-accent/40";

function HoverRevealArrow({ size = "sm" }: { size?: "sm" | "md" }) {
  const iconSize = size === "sm" ? "size-3.5" : "size-4";
  const hoverWidth =
    size === "sm"
      ? "group-hover:w-3.5 group-focus-visible:w-3.5"
      : "group-hover:w-4 group-focus-visible:w-4";

  return (
    <ArrowRight
      className={`${iconSize} w-0 shrink-0 overflow-hidden opacity-0 transition-all duration-200 motion-reduce:transition-none group-hover:ml-1.5 group-hover:opacity-100 group-focus-visible:ml-1.5 group-focus-visible:opacity-100 ${hoverWidth}`}
    />
  );
}

function experimentHref(slug: string): string {
  return `${docsRoute}/experiments/${slug}`;
}

function docHref(path: string): string {
  return `${docsRoute}/${path}`;
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-fd-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function SectionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-brand hover:underline"
    >
      {children}
      <ArrowRight className="size-4" />
    </Link>
  );
}

function BindingChip({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-fd-border bg-fd-secondary px-1.5 py-0.5 text-[11px] font-medium text-fd-muted-foreground">
      {label}
    </span>
  );
}

function FeaturedCard({
  experiment,
  showNewBadge,
}: {
  experiment: HomeExperiment;
  showNewBadge: boolean;
}) {
  const bindings = getExperimentBindings(experiment.slug);

  return (
    <div className="group relative flex flex-col rounded-xl border border-fd-border bg-fd-background transition-colors hover:border-brand/40 hover:bg-fd-accent/40">
      <div className="flex flex-1 flex-col p-5 pb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold group-hover:text-brand">
            {/* Stretched link: the whole card opens the docs; Deploy sits above it. */}
            <Link
              href={experimentHref(experiment.slug)}
              className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
            >
              {experiment.title}
            </Link>
          </h3>
          {showNewBadge && experiment.status ? (
            <SidebarStatusBadge status={experiment.status} />
          ) : null}
        </div>
        <p className="mt-1.5 flex-1 text-sm text-fd-muted-foreground">{experiment.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {bindings.length > 0 ? (
            bindings.map((binding) => <BindingChip key={binding} label={binding} />)
          ) : (
            <BindingChip label="Zero bindings" />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-fd-border px-5 py-3">
        <span className="inline-flex items-center gap-1 text-sm text-fd-muted-foreground group-hover:text-brand">
          API docs
          <ArrowRight className="size-3.5" />
        </span>
        <a
          href={experimentDeployUrl(experiment.slug)}
          target="_blank"
          rel="noreferrer"
          className="relative z-10 inline-flex items-center gap-1.5 rounded-md bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
        >
          <Rocket className="size-3.5" />
          Deploy
        </a>
      </div>
    </div>
  );
}

function CategoryCard({ category }: { category: HomeCategory }) {
  const highlights = category.experiments.slice(0, 3).map((experiment) => experiment.title);

  return (
    <Link href={`${docsRoute}#${category.id}`} className={`${homeInteractiveCardClass} p-5`}>
      <div className="flex items-center gap-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${category.accent}`}
        >
          <category.icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h3 className="inline-flex items-center font-semibold group-hover:text-brand group-focus-visible:text-brand">
            {category.title}
            <HoverRevealArrow />
          </h3>
          <p className="text-xs text-fd-muted-foreground">
            {category.experiments.length} experiments
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-fd-muted-foreground">{category.description}</p>
      <p className="mt-3 truncate text-xs text-fd-muted-foreground/80">{highlights.join(" · ")}</p>
    </Link>
  );
}

function DocLinkCard({ link }: { link: HomeDocLink }) {
  return (
    <Link href={docHref(link.href)} className={`${homeInteractiveCardClass} p-5`}>
      <div className="flex items-start gap-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${link.accent}`}
        >
          <link.icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h3 className="inline-flex items-center font-semibold group-hover:text-brand group-focus-visible:text-brand">
            {link.title}
            <HoverRevealArrow />
          </h3>
          <p className="mt-1.5 text-sm text-fd-muted-foreground">{link.description}</p>
        </div>
      </div>
    </Link>
  );
}

function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full min-w-0 max-w-(--fd-layout-width) px-6 ${className ?? ""}`}>
      {children}
    </div>
  );
}

const primaryButtonClass =
  "inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition-opacity hover:opacity-90";
const secondaryButtonClass =
  "inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-secondary px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent";
const tertiaryButtonClass =
  "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-fd-accent dark:text-white dark:hover:bg-white/10";

export function HomePage() {
  const stats = getCatalogStats();
  const featuredNewSlugs = new Set(
    featuredExperiments
      .filter((experiment) => experiment.status === "new")
      .slice(0, maxFeaturedNewBadges)
      .map((experiment) => experiment.slug)
  );
  const proofItems = [
    "MIT licensed",
    `${stats.experimentCount} experiments`,
    `${stats.bindingCount} Cloudflare bindings`,
    `${stats.categoryCount} categories`,
    ...(stats.lastUpdated ? [`Updated ${stats.lastUpdated}`] : []),
  ];

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-fd-border">
        <HeroBackdrop />
        <PageShell className="relative flex flex-col items-center gap-8 py-20 text-center md:py-24">
          <HeroReveal>
            <Link
              href={docHref("changelog")}
              className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-3 py-1 text-xs font-medium text-fd-foreground transition-colors hover:border-brand/60"
            >
              <span className="font-semibold text-brand">{stats.experimentCount} experiments</span>
              <span className="h-3 w-px bg-fd-border" aria-hidden />
              <span className="text-zinc-700 dark:text-white/90">See what&apos;s new</span>
              <ArrowRight className="size-3 text-zinc-700 dark:text-white/90" />
            </Link>
          </HeroReveal>
          <HeroReveal delay={0.05} className="flex max-w-3xl flex-col gap-5">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>
            <p className="text-base text-pretty text-zinc-700 md:text-lg dark:text-white/90">
              {heroDescription(stats.experimentCount)}
            </p>
          </HeroReveal>
          <HeroReveal delay={0.1} className="flex flex-wrap items-center justify-center gap-3">
            <Link href={experimentsIndexRoute} className={primaryButtonClass}>
              <LayoutGrid className="size-4" />
              Browse experiments
            </Link>
            <Link href={docHref("quickstart")} className={secondaryButtonClass}>
              <Rocket className="size-4" />
              Quick start
            </Link>
            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noreferrer"
              className={tertiaryButtonClass}
            >
              <GitBranch className="size-4" />
              View on GitHub
            </a>
          </HeroReveal>
          <HeroReveal delay={0.16}>
            <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-zinc-600 dark:text-white/80">
              {proofItems.map((item, index) => (
                <li key={item} className="flex items-center gap-3">
                  {index > 0 ? (
                    <span className="text-zinc-400 dark:text-white/40" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  {item}
                </li>
              ))}
            </ul>
          </HeroReveal>
        </PageShell>
      </section>

      {/* Featured */}
      <section className="py-14 md:py-16">
        <PageShell>
          <SectionHeading
            eyebrow="Start here"
            title="Featured experiments"
            description="Useful on day one and easy to demo. Each has full API docs and a one-click Deploy to your Cloudflare account."
            action={<SectionLink href={experimentsIndexRoute}>All experiments</SectionLink>}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredExperiments.map((experiment) => (
              <FeaturedCard
                key={experiment.slug}
                experiment={experiment}
                showNewBadge={featuredNewSlugs.has(experiment.slug)}
              />
            ))}
          </div>
        </PageShell>
      </section>

      {/* Categories */}
      <section className="border-y border-fd-border bg-fd-card/20 py-14 md:py-16">
        <PageShell>
          <SectionHeading
            eyebrow="Catalog"
            title="Browse by category"
            description="Grouped the same way as the docs sidebar. Use docs search with tags like ai, d1, r2, or do to filter by binding."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {homeCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </PageShell>
      </section>

      {/* Workflow */}
      <section className="py-14 md:py-16">
        <PageShell>
          <SectionHeading
            eyebrow="Workflow"
            title="From clone to deployed Worker in four steps"
            description="Every experiment follows the same Turborepo layout. Pick one, run it locally, deploy it on its own, then adapt the pattern."
            action={<SectionLink href={docHref("quickstart")}>Quick start guide</SectionLink>}
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <ol className="grid gap-3 sm:grid-cols-2">
              {homeWorkflow.map((item) => (
                <li key={item.step} className="rounded-xl border border-fd-border p-4">
                  <span className="font-mono text-xs font-semibold text-brand">{item.step}</span>
                  <h3 className="mt-1 font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-fd-muted-foreground">{item.description}</p>
                </li>
              ))}
            </ol>
            <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-background">
              <div className="flex items-center gap-2 border-b border-fd-border bg-fd-muted/30 px-4 py-2">
                <Terminal className="size-4 text-fd-muted-foreground" />
                <span className="text-xs text-fd-muted-foreground">Terminal</span>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
                <code>{`git clone ${githubCloneUrl}
cd ${gitConfig.repo}
npm install
npm run dev -- --filter=ai-website-summary
curl "http://localhost:8787/summary?url=https://example.com"`}</code>
              </pre>
            </div>
          </div>
        </PageShell>
      </section>

      {/* Principles */}
      <section className="border-t border-fd-border bg-fd-card/20 py-14 md:py-16">
        <PageShell>
          <SectionHeading
            eyebrow="Philosophy"
            title="Reference implementations, not toy examples"
            description="One focused experiment per product capability, with tests, docs, and a Deploy button."
            action={<SectionLink href={docHref("philosophy")}>Read the philosophy</SectionLink>}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {homePrinciples.map((principle) => (
              <div key={principle.title} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" />
                <div>
                  <h3 className="font-semibold">{principle.title}</h3>
                  <p className="mt-1 text-sm text-fd-muted-foreground">{principle.description}</p>
                </div>
              </div>
            ))}
          </div>
        </PageShell>
      </section>

      {/* Documentation links */}
      <section className="py-14 md:py-16">
        <PageShell>
          <SectionHeading
            eyebrow="Documentation"
            title="Learn how the monorepo works"
            description="Guides for getting started, contributing new experiments, and understanding deployment patterns."
            action={<SectionLink href={docsRoute}>Browse all docs</SectionLink>}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {docLinks.slice(0, 3).map((link) => (
              <DocLinkCard key={link.href} link={link} />
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {docLinks.slice(3).map((link) => (
              <DocLinkCard key={link.href} link={link} />
            ))}
          </div>
        </PageShell>
      </section>

      {/* CTA footer */}
      <section className="border-t border-fd-border py-14 md:py-16">
        <PageShell>
          <div className="rounded-2xl border border-brand/30 bg-brand/5 px-6 py-12 text-center md:px-12">
            <h2 className="text-2xl font-semibold md:text-3xl">Ready to build at the edge?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-fd-muted-foreground">
              Pick one of {stats.experimentCount} experiments, deploy it in minutes, and use the
              source as a reference for your next Cloudflare Worker. Everything is MIT licensed.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href={experimentsIndexRoute} className={primaryButtonClass}>
                <LayoutGrid className="size-4" />
                Browse experiments
              </Link>
              <Link href={docHref("quickstart")} className={secondaryButtonClass}>
                <Rocket className="size-4" />
                Quick start
              </Link>
            </div>
          </div>
        </PageShell>
      </section>
    </div>
  );
}
