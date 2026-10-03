import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "fumadocs-ui/layouts/notebook/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { getMDXComponents } from "@/components/mdx";
import { SelfHostedCatalogView } from "@/components/self-hosted-catalog";
import { getSelfHostedCatalog, mergeSelfHostedToc } from "@/lib/self-hosted";
import { getCachedPage, source } from "@/lib/source";

type DocsPageRecord = NonNullable<ReturnType<typeof getCachedPage>>;

export async function SelfHostedDocsPage({
  page,
  markdownUrl,
  githubUrl,
}: {
  page: DocsPageRecord;
  markdownUrl: string;
  githubUrl: string;
}) {
  const catalog = await getSelfHostedCatalog();
  const toc = mergeSelfHostedToc(page.data.toc, catalog);
  const MDX = page.data.body;

  return (
    <DocsPage toc={toc} full={page.data.full} tableOfContent={{ enabled: true }}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="flex flex-row flex-wrap items-center gap-2 not-prose">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={githubUrl} />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
            // Reuse the already-fetched catalog (server-dedup / no waterfall).
            SelfHostedCatalog: () => <SelfHostedCatalogView catalog={catalog} />,
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}
