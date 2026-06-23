import { SiteBanner } from "@/components/site-banner";
import { SidebarCategory } from "@/components/sidebar-category";
import { docsLayoutOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <>
      <SiteBanner />
      <DocsLayout
        {...docsLayoutOptions}
        tree={source.getPageTree()}
        sidebar={{
          collapsible: true,
          defaultOpenLevel: 1,
          components: {
            Separator: SidebarCategory,
          },
        }}
      >
        {children}
      </DocsLayout>
    </>
  );
}
