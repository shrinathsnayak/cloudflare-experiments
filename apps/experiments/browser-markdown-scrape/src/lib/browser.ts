import type { BrowserRun } from "../types/env";
import type { QuickActionPayload } from "../types/browser";

function isResponse(value: unknown): value is Response {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Response).json === "function" &&
    typeof (value as Response).ok === "boolean"
  );
}

/**
 * Call Browser Rendering quickAction and normalize Response or result object to a payload.
 */
export async function runQuickAction(
  browser: BrowserRun,
  action: "markdown" | "scrape",
  params: Record<string, unknown>
): Promise<QuickActionPayload> {
  const raw = await browser.quickAction(action, params);

  if (isResponse(raw)) {
    let body: QuickActionPayload;
    try {
      body = (await raw.json()) as QuickActionPayload;
    } catch {
      throw new Error(`Browser ${action} returned non-JSON response`);
    }
    if (!raw.ok || body.success === false) {
      throw new Error(body.error ?? `Browser ${action} failed (${raw.status})`);
    }
    return body;
  }

  if (raw.success === false) {
    throw new Error(typeof raw.result === "string" ? raw.result : `Browser ${action} failed`);
  }

  return raw;
}

export function extractMarkdown(payload: QuickActionPayload): string {
  const { result } = payload;
  if (typeof result === "string") return result;
  if (
    result &&
    typeof result === "object" &&
    "markdown" in result &&
    typeof (result as { markdown: unknown }).markdown === "string"
  ) {
    return (result as { markdown: string }).markdown;
  }
  throw new Error("Browser markdown response missing result string");
}

export function extractScrapeResults(payload: QuickActionPayload): unknown {
  const { result } = payload;
  if (Array.isArray(result)) return result;
  if (
    result &&
    typeof result === "object" &&
    "results" in result &&
    Array.isArray((result as { results: unknown }).results)
  ) {
    return (result as { results: unknown[] }).results;
  }
  throw new Error("Browser scrape response missing results array");
}
