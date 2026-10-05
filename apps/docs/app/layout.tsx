import TraksProvider from "next-traks";
import { JsonLd } from "@/components/json-ld";
import { DocsRootProvider } from "@/components/root-provider";
import "./global.css";
import { fontVariables, uiFont } from "@/lib/fonts";
import { createRootMetadata, createWebsiteJsonLd, rootViewport } from "@/lib/seo";

export const metadata = createRootMetadata();
export const viewport = rootViewport;

/** First-party path; proxied to the Traks collector by the site Worker (not Next routes). */
const traksScriptPath = "/t.js";

/** Inlined at build time - must be set in Workers Builds vars (CI has no `.env.local`). */
const traksSite = process.env.NEXT_PUBLIC_TRAKS_SITE?.trim();

export default function Layout({ children }: LayoutProps<"/">) {
  const body = (
    <>
      <JsonLd data={createWebsiteJsonLd()} />
      <DocsRootProvider>{children}</DocsRootProvider>
    </>
  );

  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className={`${uiFont.className} flex flex-col min-h-screen`}>
        {traksSite ? (
          <TraksProvider
            enabled={process.env.NODE_ENV === "production"}
            site={traksSite}
            src={traksScriptPath}
          >
            {body}
          </TraksProvider>
        ) : (
          body
        )}
      </body>
    </html>
  );
}
