import Link from "next/link";
import type { ReactNode } from "react";
import { BlogCoverImage } from "@/components/blog-cover-image";
import type { BlogPostMeta } from "@/lib/blog-meta";
import { blogPostPath, experimentDocsPath } from "@/lib/blog-meta";
import {
  aboutRoute,
  brandProductName,
  blogsRoute,
  contactRoute,
  developersRoute,
  docsRoute,
  homeRoute,
  privacyRoute,
} from "@/lib/shared";

function formatBlogDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function RelatedPagesNav() {
  return (
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
  );
}

export function BlogIndexShell({ posts }: { posts: BlogPostMeta[] }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 md:py-16">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Blog</h1>
      <p className="mt-4 text-pretty text-fd-muted-foreground md:text-lg">
        Practical guides for Cloudflare products - each article points to deployable experiments you
        can clone or one-click Deploy.
      </p>

      <ul className="mt-10 space-y-10">
        {posts.map((post) => (
          <li key={post.slug} className="border-b border-fd-border pb-10 last:border-b-0">
            <p className="text-xs text-fd-muted-foreground">
              {post.featured ? (
                <>
                  <span className="font-medium text-brand">Featured</span>
                  <span aria-hidden="true"> · </span>
                </>
              ) : null}
              <time dateTime={post.datePublished}>{formatBlogDate(post.datePublished)}</time>
              <span aria-hidden="true"> · </span>
              {post.readingMinutes} min read
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              <Link className="hover:text-brand" href={blogPostPath(post.slug)}>
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 text-fd-muted-foreground">{post.description}</p>
            <p className="mt-3 text-sm">
              <Link className="text-brand hover:underline" href={blogPostPath(post.slug)}>
                Read article
              </Link>
              <span className="text-fd-muted-foreground">
                {" "}
                · {post.relatedExperiments.length} related experiment
                {post.relatedExperiments.length === 1 ? "" : "s"}
              </span>
            </p>
          </li>
        ))}
      </ul>

      <RelatedPagesNav />
      <p className="mt-6 text-xs text-fd-muted-foreground">
        {brandProductName} is an independent open-source catalog - not affiliated with Cloudflare,
        Inc.
      </p>
    </main>
  );
}

export function BlogPostShell({
  post,
  children,
}: {
  post: BlogPostMeta;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 md:py-16">
      <article>
        <header>
          <p className="text-sm text-fd-muted-foreground">
            <Link className="hover:text-brand hover:underline" href={blogsRoute}>
              Blog
            </Link>
            <span aria-hidden="true"> · </span>
            <time dateTime={post.datePublished}>{formatBlogDate(post.datePublished)}</time>
            <span aria-hidden="true"> · </span>
            {post.readingMinutes} min read
          </p>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-balance leading-snug md:text-4xl md:leading-snug">
            {post.title}
          </h1>
          <p className="mt-5 text-pretty text-fd-muted-foreground md:text-lg">{post.description}</p>
          {post.cover ? <BlogCoverImage cover={post.cover} priority className="mt-8" /> : null}
        </header>

        <div className="prose prose-neutral mt-10 dark:prose-invert max-w-none">{children}</div>

        <section className="prose prose-neutral mt-12 dark:prose-invert max-w-none">
          <h2>Related experiments</h2>
          <p>
            These deployable references implement the patterns in this article. Open the docs for
            API details, then Deploy or clone the source.
          </p>
          <ul>
            {post.relatedExperiments.map((experiment) => (
              <li key={experiment.slug}>
                <Link href={experimentDocsPath(experiment.slug)}>{experiment.title}</Link> -{" "}
                {experiment.blurb}
              </li>
            ))}
          </ul>
        </section>
      </article>

      <RelatedPagesNav />
      <p className="mt-6 text-xs text-fd-muted-foreground">
        {brandProductName} is an independent open-source catalog - not affiliated with Cloudflare,
        Inc.
      </p>
    </main>
  );
}
