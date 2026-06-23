import { SiteBanner } from "@/components/site-banner";
import { homeLayoutOptions } from "@/lib/layout.shared";
import { HomeLayout } from "fumadocs-ui/layouts/home";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteBanner />
      <HomeLayout {...homeLayoutOptions}>{children}</HomeLayout>
    </>
  );
}
