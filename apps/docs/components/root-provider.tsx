"use client";

import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";

export function DocsRootProvider({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      theme={{
        defaultTheme: "dark",
        enableSystem: true,
        // next-themes injects an inline script for FOUC prevention. React 19 warns
        // about <script> in client trees; application/json suppresses the dev warning
        // on the client while SSR still emits an executable script.
        scriptProps: typeof window === "undefined" ? undefined : { type: "application/json" },
      }}
      search={{
        options: {
          api: "/api/search",
        },
      }}
    >
      {children}
    </RootProvider>
  );
}
