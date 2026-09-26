/// <reference types="@cloudflare/workers-types" />

export type BrowserRun = {
  quickAction(
    action: "markdown" | "scrape",
    params: Record<string, unknown>
  ): Promise<Response | { success?: boolean; result?: unknown }>;
};

export type Env = {
  BROWSER: BrowserRun;
};
