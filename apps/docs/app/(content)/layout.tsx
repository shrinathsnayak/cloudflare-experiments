import { SiteBanner } from "@/components/site-banner";
import { SidebarCategory } from "@/components/sidebar-category";
import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteBanner />
      <DocsLayout
        {...baseOptions()}
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
