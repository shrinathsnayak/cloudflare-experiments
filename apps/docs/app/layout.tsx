import { JsonLd } from "@/components/json-ld";
import { DocsRootProvider } from "@/components/root-provider";
import "./global.css";
import { fontVariables, uiFont } from "@/lib/fonts";
import { createRootMetadata, createWebsiteJsonLd } from "@/lib/seo";

export const metadata = createRootMetadata();

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className={`${uiFont.className} flex flex-col min-h-screen`}>
        <JsonLd data={createWebsiteJsonLd()} />
        <DocsRootProvider>{children}</DocsRootProvider>
      </body>
    </html>
  );
}
