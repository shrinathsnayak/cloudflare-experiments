import Link from "next/link";
import { appName, developersRoute, docsRoute, homeRoute, siteUrl } from "@/lib/shared";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col justify-center px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-4 text-pretty text-fd-muted-foreground">
        This URL is not part of {appName}. Agents requesting{" "}
        <code className="text-sm">Accept: text/markdown</code> receive a Markdown error body with
        the same recovery links.
      </p>
      <ul className="mt-8 space-y-2 text-sm">
        <li>
          <Link className="text-brand hover:underline" href={homeRoute}>
            Homepage
          </Link>
        </li>
        <li>
          <Link className="text-brand hover:underline" href={docsRoute}>
            Docs
          </Link>
        </li>
        <li>
          <Link className="text-brand hover:underline" href={developersRoute}>
            Developer resources
          </Link>
        </li>
        <li>
          <a className="text-brand hover:underline" href={`${siteUrl}/llms.txt`}>
            llms.txt
          </a>
        </li>
        <li>
          <a className="text-brand hover:underline" href={`${siteUrl}/sitemap.xml`}>
            Sitemap
          </a>
        </li>
        <li>
          <a className="text-brand hover:underline" href={`${siteUrl}/openapi.json`}>
            OpenAPI
          </a>
        </li>
      </ul>
    </main>
  );
}
