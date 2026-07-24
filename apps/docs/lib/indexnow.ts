import { siteUrl } from "@/lib/shared";

export const indexNowEndpoint = "https://api.indexnow.org/indexnow";

const MAX_URLS_PER_REQUEST = 10_000;

export function indexNowKeyLocation(key: string): string {
  return `${siteUrl}/${key}.txt`;
}

export function getIndexNowKey(): string {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key) {
    throw new Error("INDEXNOW_KEY is not set");
  }
  if (key.length < 8 || key.length > 128 || !/^[A-Za-z0-9-]+$/.test(key)) {
    throw new Error(
      "INDEXNOW_KEY must be 8–128 characters (letters, numbers, dashes only)"
    );
  }
  return key;
}

function extractLocs(sitemapXml: string): string[] {
  const locs: string[] = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(sitemapXml)) !== null) {
    locs.push(match[1].trim());
  }
  return locs;
}

export async function fetchSitemapUrls(): Promise<string[]> {
  const res = await fetch(`${siteUrl}/sitemap.xml`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch sitemap: ${res.status} ${res.statusText}`);
  }
  const urls = extractLocs(await res.text());
  if (urls.length === 0) {
    throw new Error("Sitemap contained no <loc> URLs");
  }
  return urls;
}

function assertSameHost(urls: string[]): void {
  const host = new URL(siteUrl).host;
  for (const url of urls) {
    const parsed = new URL(url);
    if (parsed.host !== host) {
      throw new Error(`URL host mismatch (expected ${host}): ${url}`);
    }
  }
}

async function submitBatch(key: string, urlList: string[]): Promise<number> {
  const res = await fetch(indexNowEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(siteUrl).host,
      key,
      keyLocation: indexNowKeyLocation(key),
      urlList,
    }),
  });

  if (res.status !== 200 && res.status !== 202) {
    const body = await res.text();
    throw new Error(`IndexNow HTTP ${res.status}${body ? `: ${body}` : ""}`);
  }

  return res.status;
}

export type IndexNowSubmitResult = {
  submitted: number;
  statuses: number[];
};

export async function submitUrlsToIndexNow(
  urls?: string[]
): Promise<IndexNowSubmitResult> {
  const key = getIndexNowKey();
  const urlList = urls && urls.length > 0 ? urls : await fetchSitemapUrls();
  assertSameHost(urlList);

  const statuses: number[] = [];
  for (let i = 0; i < urlList.length; i += MAX_URLS_PER_REQUEST) {
    const batch = urlList.slice(i, i + MAX_URLS_PER_REQUEST);
    statuses.push(await submitBatch(key, batch));
  }

  return { submitted: urlList.length, statuses };
}
