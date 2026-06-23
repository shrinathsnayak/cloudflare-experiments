import { Card, Cards } from "fumadocs-ui/components/card";
import {
  cloudflareBindings,
  docLinks,
  featuredExperiments,
  homeCategories,
  homePrinciples,
  homeStats,
  homeWorkflow,
  platformCapabilities,
  repoStructure,
  type HomeExperiment,
} from "@/lib/home-content";
import { appName, docsRoute, gitConfig, githubCloneUrl, githubRepoUrl, heroDescription, heroTitle } from "@/lib/shared";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GitBranch,
  Globe,
  Layers,
  Rocket,
  Search,
  Terminal,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const homeInteractiveCardClass =
  "group flex flex-col rounded-xl border border-fd-border bg-fd-background p-4 transition-colors hover:border-brand/40 hover:bg-fd-accent/40";

function HoverRevealArrow({ size = "sm" }: { size?: "sm" | "md" }) {
  const iconSize = size === "sm" ? "size-3.5" : "size-4";
  const hoverWidth = size === "sm" ? "group-hover:w-3.5 group-focus-visible:w-3.5" : "group-hover:w-4 group-focus-visible:w-4";
  const hoverMargin = size === "sm" ? "group-hover:ml-1.5 group-focus-visible:ml-1.5" : "group-hover:ml-1.5 group-focus-visible:ml-1.5";

  return (
    <ArrowRight
      className={`${iconSize} w-0 shrink-0 overflow-hidden opacity-0 transition-all duration-200 motion-reduce:transition-none group-hover:opacity-100 group-focus-visible:opacity-100 ${hoverWidth} ${hoverMargin}`}
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
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
      {description ? (
        <p className="mt-3 max-w-3xl text-fd-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

function ExperimentCard({ experiment }: { experiment: HomeExperiment }) {
  return (
    <Link
      href={experimentHref(experiment.slug)}
      className={homeInteractiveCardClass}
    >
      <span className="inline-flex items-center font-medium group-hover:text-brand group-focus-visible:text-brand">
        {experiment.title}
        <HoverRevealArrow />
      </span>
      <span className="mt-1 text-sm text-fd-muted-foreground">{experiment.description}</span>
    </Link>
  );
}

function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-(--fd-layout-width) px-6 ${className ?? ""}`}>
      {children}
    </div>
  );
}

export function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-fd-border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(243,128,32,0.12),transparent_55%)]" />
        <PageShell className="relative flex flex-col items-center gap-8 py-20 text-center md:py-28">
          <div className="flex max-w-3xl flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
              {appName}
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>
            <p className="text-base text-fd-muted-foreground md:text-lg">{heroDescription}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={docsRoute}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <BookOpen className="size-4" />
              Read the docs
            </Link>
            <Link
              href={docHref("quickstart")}
              className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-secondary px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              <Rocket className="size-4" />
              Quick start
            </Link>
            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              <GitBranch className="size-4" />
              View on GitHub
            </a>
          </div>
          <div className="grid w-full max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {homeStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-fd-border bg-fd-card/50 px-4 py-3 text-center"
              >
                <div className="text-xl font-bold text-brand">{stat.value}</div>
                <div className="text-xs text-fd-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </PageShell>
      </section>

      {/* Why */}
      <section className="py-16 md:py-20">
        <PageShell>
          <SectionHeading
            eyebrow="Philosophy"
            title="Reference implementations, not toy examples"
            description="Most Cloudflare tutorials stop at Hello World. This repo shows what you can actually build - one focused experiment per product capability, with tests, docs, and a deploy button."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {homePrinciples.map((principle) => (
              <div
                key={principle.title}
                className="rounded-xl border border-fd-border bg-fd-card/30 p-5"
              >
                <CheckCircle2 className="mb-3 size-5 text-brand" />
                <h3 className="font-semibold">{principle.title}</h3>
                <p className="mt-2 text-sm text-fd-muted-foreground">{principle.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href={docHref("philosophy")}
              className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
            >
              Read the full philosophy
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </PageShell>
      </section>

      {/* Workflow */}
      <section className="border-y border-fd-border bg-fd-card/20 py-16 md:py-20">
        <PageShell>
          <SectionHeading
            eyebrow="Workflow"
            title="From clone to deployed Worker in four steps"
            description="Every experiment follows the same Turborepo layout. Pick one, run it locally, deploy independently, then adapt the pattern."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {homeWorkflow.map((item) => (
              <div key={item.step} className="relative rounded-xl border border-fd-border p-5">
                <span className="text-3xl font-bold text-brand/30">{item.step}</span>
                <h3 className="mt-2 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-fd-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 overflow-hidden rounded-xl border border-fd-border bg-fd-background">
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
        </PageShell>
      </section>

      {/* Featured */}
      <section className="py-16 md:py-20">
        <PageShell>
          <SectionHeading
            eyebrow="Popular"
            title="Featured experiments"
            description="A starting point if you are not sure where to begin - each links to full API docs and a Deploy button."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredExperiments.map((experiment) => (
              <ExperimentCard key={experiment.slug} experiment={experiment} />
            ))}
          </div>
        </PageShell>
      </section>

      {/* Platform capabilities */}
      <section className="border-t border-fd-border bg-fd-card/20 py-16 md:py-20">
        <PageShell>
          <SectionHeading
            eyebrow="Platform"
            title="Cloudflare capabilities in practice"
            description="Every experiment maps to a specific product or binding. Use these as copy-paste references when wiring up your own Workers."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {platformCapabilities.map(({ icon: Icon, title, description, href }) => (
              <Link
                key={title}
                href={docHref(href)}
                className={`${homeInteractiveCardClass} p-5`}
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 inline-flex items-center font-semibold group-hover:text-brand group-focus-visible:text-brand">
                  {title}
                  <HoverRevealArrow size="md" />
                </h3>
                <p className="mt-2 flex-1 text-sm text-fd-muted-foreground">{description}</p>
              </Link>
            ))}
          </div>
        </PageShell>
      </section>

      {/* Bindings + repo structure */}
      <section className="py-16 md:py-20">
        <PageShell>
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Bindings"
                title="Search docs by binding"
                description="Use the docs search bar with tags like ai, browser, d1, r2, or do to filter experiments by Cloudflare binding."
              />
              <div className="mt-6 flex flex-wrap gap-2">
                {cloudflareBindings.map((binding) => (
                  <span
                    key={binding}
                    className="rounded-md border border-fd-border bg-fd-secondary px-2.5 py-1 font-mono text-xs text-fd-muted-foreground"
                  >
                    {binding}
                  </span>
                ))}
              </div>
              <Link
                href={docHref("reference/cloudflare-features")}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
              >
                Cloudflare features reference
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div>
              <SectionHeading
                eyebrow="Structure"
                title="Consistent experiment layout"
                description="Every Worker under apps/experiments/ uses the same folder conventions - routes, lib, types, tests, and wrangler.json."
              />
              <ul className="mt-6 space-y-3">
                {repoStructure.map((item) => (
                  <li
                    key={item.path}
                    className="flex items-start gap-3 rounded-lg border border-fd-border bg-fd-card/30 px-4 py-3"
                  >
                    <code className="shrink-0 text-sm text-brand">{item.path}</code>
                    <span className="text-sm text-fd-muted-foreground">{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </PageShell>
      </section>

      {/* All categories */}
      <section className="border-t border-fd-border bg-fd-card/20 py-16 md:py-20">
        <PageShell>
          <SectionHeading
            eyebrow="Catalog"
            title="All experiments by category"
            description="Browse the full catalog - 60+ deployable Workers organized the same way as the documentation sidebar."
          />
          <div className="mt-12 space-y-14">
            {homeCategories.map((category) => (
              <div key={category.id} id={category.id} className="home-catalog-category">
                <div className="mb-6 flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <category.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold">{category.title}</h3>
                    <p className="mt-1 text-sm text-fd-muted-foreground">{category.description}</p>
                    <p className="mt-1 text-xs text-fd-muted-foreground">
                      {category.experiments.length} experiments
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {category.experiments.map((experiment) => (
                    <ExperimentCard key={experiment.slug} experiment={experiment} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PageShell>
      </section>

      {/* Documentation links */}
      <section className="py-16 md:py-20">
        <PageShell>
          <SectionHeading
            eyebrow="Documentation"
            title="Learn how the monorepo works"
            description="Guides for getting started, contributing new experiments, and understanding deployment patterns."
          />
          <div className="mt-10">
            <Cards>
              {docLinks.map((link) => (
                <Card
                  key={link.href}
                  title={link.title}
                  description={link.description}
                  href={docHref(link.href)}
                />
              ))}
            </Cards>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Link
              href={docsRoute}
              className="flex items-center gap-3 rounded-xl border border-fd-border p-5 transition-colors hover:border-brand/40 hover:bg-fd-accent/40"
            >
              <BookOpen className="size-5 text-brand" />
              <div>
                <div className="font-medium">Introduction</div>
                <div className="text-sm text-fd-muted-foreground">Overview and category index</div>
              </div>
            </Link>
            <Link
              href={docHref("contributing")}
              className="flex items-center gap-3 rounded-xl border border-fd-border p-5 transition-colors hover:border-brand/40 hover:bg-fd-accent/40"
            >
              <Zap className="size-5 text-brand" />
              <div>
                <div className="font-medium">Contributing</div>
                <div className="text-sm text-fd-muted-foreground">Add your own experiment</div>
              </div>
            </Link>
            <Link
              href={docHref("reference/deployment")}
              className="flex items-center gap-3 rounded-xl border border-fd-border p-5 transition-colors hover:border-brand/40 hover:bg-fd-accent/40"
            >
              <Globe className="size-5 text-brand" />
              <div>
                <div className="font-medium">Deployment guide</div>
                <div className="text-sm text-fd-muted-foreground">
                  Bindings, secrets, and deploy buttons
                </div>
              </div>
            </Link>
          </div>
        </PageShell>
      </section>

      {/* Get started cards (original section, expanded) */}
      <section className="border-t border-fd-border bg-fd-card/20 py-16 md:py-20">
        <PageShell>
          <SectionHeading
            title="Get started"
            description="Jump in with the path that fits your goal."
          />
          <div className="mt-10">
            <Cards className="grid gap-4 sm:grid-cols-3">
              <Card
                title="Introduction"
                description="What this project is, how experiments are organized, and platform capabilities."
                href={docsRoute}
                icon={<BookOpen />}
              />
              <Card
                title="Quick Start"
                description="Install dependencies, run locally, and deploy an experiment in minutes."
                href={docHref("quickstart")}
                icon={<Rocket />}
              />
              <Card
                title="Browse experiments"
                description="Explore 60+ Workers covering AI, scraping, monitoring, storage, and more."
                href={docHref("experiments/ai-website-summary")}
                icon={<Search />}
              />
              <Card
                title="Philosophy"
                description="Design principles behind edge-first, single-responsibility experiments."
                href={docHref("philosophy")}
                icon={<Layers />}
              />
              <Card
                title="Contributing"
                description="Add a new experiment, run tests, and open a pull request."
                href={docHref("contributing")}
                icon={<Zap />}
              />
              <Card
                title="Cloudflare features"
                description="Reference guide to bindings and platform capabilities used across experiments."
                href={docHref("reference/cloudflare-features")}
                icon={<Globe />}
              />
            </Cards>
          </div>
        </PageShell>
      </section>

      {/* CTA footer */}
      <section className="border-t border-fd-border py-16 md:py-20">
        <PageShell>
          <div className="rounded-2xl border border-brand/30 bg-brand/5 px-6 py-12 text-center md:px-12">
            <h2 className="text-2xl font-semibold md:text-3xl">Ready to build at the edge?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-fd-muted-foreground">
              Pick an experiment, deploy it in minutes, and use the source as a reference for your
              next Cloudflare Worker. All experiments are MIT licensed.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={docHref("quickstart")}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <Rocket className="size-4" />
                Start with Quick Start
              </Link>
              <Link
                href={docHref("experiments/ai-website-summary")}
                className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
              >
                Browse experiments
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </PageShell>
      </section>
    </div>
  );
}
