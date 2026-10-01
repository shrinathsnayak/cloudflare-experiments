import { AppLogo } from "@/components/app-logo";
import {
  appName,
  docsRoute,
  experimentsIndexRoute,
  githubRepoUrl,
  homeRoute,
  portfolioUrl,
} from "@/lib/shared";
import Link from "next/link";

const footerColumns = [
  {
    title: "Explore",
    links: [
      { label: "Experiments", href: experimentsIndexRoute },
      { label: "Quick start", href: `${docsRoute}/quickstart` },
      { label: "Self-Hosted", href: `${docsRoute}/self-hosted` },
      { label: "What's New", href: `${docsRoute}/changelog` },
    ],
  },
  {
    title: "Docs",
    links: [
      { label: "Introduction", href: docsRoute },
      { label: "Philosophy", href: `${docsRoute}/philosophy` },
      { label: "Contributing", href: `${docsRoute}/contributing` },
      { label: "Deployment", href: `${docsRoute}/reference/deployment` },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "GitHub", href: githubRepoUrl, external: true },
      { label: "License (MIT)", href: `${githubRepoUrl}/blob/main/LICENSE`, external: true },
      { label: "Portfolio", href: portfolioUrl, external: true },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-fd-border bg-fd-card/30">
      <div className="mx-auto grid w-full max-w-(--fd-layout-width) gap-10 px-6 py-12 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))] md:gap-8">
        <div className="max-w-sm">
          <Link
            href={homeRoute}
            className="inline-flex text-fd-foreground transition-opacity hover:opacity-80"
          >
            <AppLogo />
          </Link>
          <p className="mt-4 text-sm text-zinc-600 dark:text-white/75">
            Deployable Cloudflare Workers experiments - reference implementations you can clone,
            run, and ship.
          </p>
          <p className="mt-3 text-xs text-zinc-500 dark:text-white/50">
            Not affiliated with or endorsed by Cloudflare, Inc.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-white/50">
              {column.title}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  {"external" in link && link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-zinc-700 transition-colors hover:text-brand dark:text-white/85 dark:hover:text-brand"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-700 transition-colors hover:text-brand dark:text-white/85 dark:hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-fd-border">
        <div className="mx-auto flex w-full max-w-(--fd-layout-width) flex-col gap-2 px-6 py-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:text-white/50">
          <p>
            {appName}. MIT licensed.
          </p>
          <p>
            Built with{" "}
            <a
              href="https://fumadocs.dev"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-2 hover:text-brand hover:underline"
            >
              Fumadocs
            </a>{" "}
            on Cloudflare Workers patterns.
          </p>
        </div>
      </div>
    </footer>
  );
}
