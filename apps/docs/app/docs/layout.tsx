import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { Banner } from "fumadocs-ui/components/banner";
import { siteBanner } from "@/lib/shared";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <>
      <Banner className="bg-[#f38020] text-white">{siteBanner.text}</Banner>
      <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
        {children}
      </DocsLayout>
    </>
  );
}
