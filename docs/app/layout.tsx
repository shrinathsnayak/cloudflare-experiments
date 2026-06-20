import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { appName, siteBanner } from "@/lib/shared";
import { Banner } from "fumadocs-ui/components/banner";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cloudflare-experiments.com"),
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description:
    "A curated collection of experiments demonstrating practical developer tools built on the Cloudflare edge platform.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <Banner id="disclaimer" changeLayout>
            {siteBanner}
          </Banner>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
