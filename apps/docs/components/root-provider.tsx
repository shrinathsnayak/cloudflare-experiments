"use client";

import { DocsSearchDialog } from "@/components/search-dialog";
import { searchTags } from "@/lib/search-tags";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";

const theme = {
  defaultTheme: "dark" as const,
  enableSystem: true,
  // next-themes injects an inline script for FOUC prevention. React 19 warns
  // about <script> in client trees; application/json suppresses the dev warning
  // on the client while SSR still emits an executable script.
  scriptProps: typeof window === "undefined" ? undefined : { type: "application/json" },
};

const search = {
  SearchDialog: DocsSearchDialog,
  options: {
    api: "/api/search",
    tags: searchTags,
    allowClear: true,
  },
};

export function DocsRootProvider({ children }: { children: ReactNode }) {
  return (
    <RootProvider theme={theme} search={search}>
      {children}
    </RootProvider>
  );
}
