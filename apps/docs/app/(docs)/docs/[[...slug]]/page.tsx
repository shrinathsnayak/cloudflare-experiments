import { Suspense } from "react";
import { JsonLd } from "@/components/json-ld";
import { getMDXComponents } from "@/components/mdx";
import { SelfHostedDocsPage } from "@/components/self-hosted-docs-page";
import { getCachedPage, getPageMarkdownUrl, source } from "@/lib/source";
import {
  createDocsBreadcrumbJsonLd,
  createDocsPageJsonLd,
  createDocsPageMetadata,
} from "@/lib/seo";
import { githubDocsBlobUrl } from "@/lib/shared";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = getCachedPage(params.slug);
  if (!page) notFound();

  const markdownUrl = getPageMarkdownUrl(page).url;
  const githubUrl = githubDocsBlobUrl(page.path);
  const isSelfHosted = page.slugs.length === 1 && page.slugs[0] === "self-hosted";
  const isChangelog = page.slugs.length === 1 && page.slugs[0] === "changelog";
  const jsonLd = [createDocsPageJsonLd(page), createDocsBreadcrumbJsonLd(page)];

  // Cheap sync branch before any self-hosted catalog work (async-cheap-condition-before-await).
  if (isSelfHosted) {
    return (
      <>
        <JsonLd data={jsonLd} />
        <Suspense
          fallback={
            <DocsPage toc={page.data.toc} full={page.data.full} tableOfContent={{ enabled: true }}>
              <DocsTitle>{page.data.title}</DocsTitle>
              <DocsDescription>{page.data.description}</DocsDescription>
              <DocsBody>
                <p className="text-fd-muted-foreground">Loading catalog…</p>
              </DocsBody>
            </DocsPage>
          }
        >
          <SelfHostedDocsPage page={page} markdownUrl={markdownUrl} githubUrl={githubUrl} />
        </Suspense>
      </>
    );
  }

  const MDX = page.data.body;

  return (
    <>
      <JsonLd data={jsonLd} />
      <DocsPage toc={page.data.toc} full={page.data.full} tableOfContent={{ enabled: true }}>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        {!isChangelog ? (
          <div className="flex flex-row flex-wrap items-center gap-2 not-prose">
            <MarkdownCopyButton markdownUrl={markdownUrl} />
            <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={githubUrl} />
          </div>
        ) : null}
        <DocsBody>
          <MDX
            components={getMDXComponents({
              a: createRelativeLink(source, page),
            })}
          />
        </DocsBody>
      </DocsPage>
    </>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<"/docs/[[...slug]]">): Promise<Metadata> {
  const params = await props.params;
  const page = getCachedPage(params.slug);
  if (!page) notFound();

  return createDocsPageMetadata(page);
}
