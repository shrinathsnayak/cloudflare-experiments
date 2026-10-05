import type { ReactNode } from "react";
import Link from "next/link";
import {
  aboutRoute,
  appName,
  blogsRoute,
  brandProductName,
  contactRoute,
  developersRoute,
  docsRoute,
  homeRoute,
  privacyRoute,
} from "@/lib/shared";

export function StaticPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 md:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">{appName}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      <p className="mt-4 text-pretty text-fd-muted-foreground md:text-lg">{description}</p>
      <div className="prose prose-neutral mt-10 dark:prose-invert max-w-none">{children}</div>
      <nav
        aria-label="Related pages"
        className="mt-12 flex flex-wrap gap-x-4 gap-y-2 border-t border-fd-border pt-6 text-sm"
      >
        <Link className="text-brand hover:underline" href={homeRoute}>
          Home
        </Link>
        <Link className="text-brand hover:underline" href={blogsRoute}>
          Blog
        </Link>
        <Link className="text-brand hover:underline" href={docsRoute}>
          Docs
        </Link>
        <Link className="text-brand hover:underline" href={developersRoute}>
          Developers
        </Link>
        <Link className="text-brand hover:underline" href={aboutRoute}>
          About
        </Link>
        <Link className="text-brand hover:underline" href={contactRoute}>
          Contact
        </Link>
        <Link className="text-brand hover:underline" href={privacyRoute}>
          Privacy
        </Link>
      </nav>
      <p className="mt-6 text-xs text-fd-muted-foreground">
        {brandProductName} is an independent open-source catalog - not affiliated with Cloudflare,
        Inc.
      </p>
    </main>
  );
}
