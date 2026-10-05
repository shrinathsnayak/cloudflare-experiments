import { docs } from "collections/server";
import { llms, loader } from "fumadocs-core/source";
import { statusBadgesPlugin } from "fumadocs-core/source/plugins/status-badges";
import { cache } from "react";
import { SidebarStatusBadge } from "@/components/sidebar-status-badge";
import { docsContentRoute, docsImageRoute, docsRoute } from "./shared";

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [
    statusBadgesPlugin({
      renderBadge: (status) => <SidebarStatusBadge status={status} />,
    }),
  ],
});

export const docsLlms = llms(source, {
  renderPage: async (page) => {
    const tags = page.data.tags ?? [];
    const bindings = page.data.bindings ?? [];
    const metaLines = [
      page.data.description ? `> ${page.data.description}` : null,
      tags.length > 0 ? `Tags: ${tags.join(", ")}` : null,
      bindings.length > 0 ? `Bindings: ${bindings.join(", ")}` : null,
      `Markdown: ${getPageMarkdownUrl(page).url}`,
    ].filter(Boolean);

    return `# ${page.data.title}

URL: ${page.url}
${metaLines.join("\n")}

${await page.data.getText("processed")}`;
  },
});

export const getCachedPage = cache((slug?: string[]) => source.getPage(slug));

export function getPageImage(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url: `${docsImageRoute}/${segments.join("/")}`,
  };
}

export function getPageMarkdownUrl(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "content.md"];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join("/")}`,
  };
}
