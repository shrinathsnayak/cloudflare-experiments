import TraksProvider from "next-traks";
import { JsonLd } from "@/components/json-ld";
import { DocsRootProvider } from "@/components/root-provider";
import "./global.css";
import { fontVariables, uiFont } from "@/lib/fonts";
import { createRootMetadata, createWebsiteJsonLd, rootViewport } from "@/lib/seo";

export const metadata = createRootMetadata();
export const viewport = rootViewport;

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className={`${uiFont.className} flex flex-col min-h-screen`}>
        <TraksProvider
          enabled={process.env.NODE_ENV === "production"}
          site={process.env.NEXT_PUBLIC_TRAKS_SITE!}
        >
          <JsonLd data={createWebsiteJsonLd()} />
          <DocsRootProvider>{children}</DocsRootProvider>
        </TraksProvider>
      </body>
    </html>
  );
}
