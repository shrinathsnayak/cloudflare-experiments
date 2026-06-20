import type { Env } from "../types/env";
import type { HistoryResponse, SnapshotRow, TrackedUrlRow } from "../types/track";
import { extractRenderedText } from "./browser";
import { summarizeDiff } from "./diff";
import { hashContent } from "./hash";

export async function registerTrackedUrl(db: D1Database, url: string): Promise<TrackedUrlRow> {
  await db.prepare("INSERT INTO tracked_urls (url) VALUES (?)").bind(url).run();
  const row = await db
    .prepare("SELECT id, url, created_at FROM tracked_urls WHERE url = ?")
    .bind(url)
    .first<TrackedUrlRow>();
  if (!row) {
    throw new Error("Failed to register tracked URL");
  }
  return row;
}

export async function getTrackedUrl(db: D1Database, url: string): Promise<TrackedUrlRow | null> {
  return db
    .prepare("SELECT id, url, created_at FROM tracked_urls WHERE url = ?")
    .bind(url)
    .first<TrackedUrlRow>();
}

export async function unregisterTrackedUrl(db: D1Database, url: string): Promise<boolean> {
  const result = await db.prepare("DELETE FROM tracked_urls WHERE url = ?").bind(url).run();
  return (result.meta.changes ?? 0) > 0;
}

export async function listTrackedUrls(db: D1Database): Promise<TrackedUrlRow[]> {
  const result = await db
    .prepare("SELECT id, url, created_at FROM tracked_urls ORDER BY id ASC")
    .all<TrackedUrlRow>();
  return result.results ?? [];
}

export async function getLatestSnapshot(
  db: D1Database,
  trackedUrlId: number
): Promise<SnapshotRow | null> {
  return db
    .prepare(
      "SELECT id, tracked_url_id, content_hash, diff_summary, r2_key, created_at FROM snapshots WHERE tracked_url_id = ? ORDER BY created_at DESC LIMIT 1"
    )
    .bind(trackedUrlId)
    .first<SnapshotRow>();
}

export async function getSnapshotHistory(
  db: D1Database,
  url: string
): Promise<HistoryResponse | null> {
  const tracked = await getTrackedUrl(db, url);
  if (!tracked) return null;

  const result = await db
    .prepare(
      "SELECT id, tracked_url_id, content_hash, diff_summary, r2_key, created_at FROM snapshots WHERE tracked_url_id = ? ORDER BY created_at DESC LIMIT 50"
    )
    .bind(tracked.id)
    .all<SnapshotRow>();

  return {
    url: tracked.url,
    snapshots: (result.results ?? []).map((row) => ({
      id: row.id,
      contentHash: row.content_hash,
      diffSummary: row.diff_summary,
      createdAt: new Date(row.created_at * 1000).toISOString(),
    })),
  };
}

export async function insertSnapshot(
  db: D1Database,
  trackedUrlId: number,
  contentHash: string,
  diffSummary: string | null,
  r2Key: string
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO snapshots (tracked_url_id, content_hash, diff_summary, r2_key) VALUES (?, ?, ?, ?)"
    )
    .bind(trackedUrlId, contentHash, diffSummary, r2Key)
    .run();
}

export async function loadSnapshotText(bucket: R2Bucket, r2Key: string): Promise<string | null> {
  const object = await bucket.get(r2Key);
  if (!object) return null;
  return object.text();
}

export async function snapshotTrackedUrls(
  env: Env
): Promise<{ processed: number; errors: number }> {
  const trackedUrls = await listTrackedUrls(env.DB);
  let processed = 0;
  let errors = 0;

  for (const tracked of trackedUrls) {
    try {
      const rendered = await extractRenderedText(env.BROWSER, tracked.url);
      const contentHash = await hashContent(rendered.text);
      const latest = await getLatestSnapshot(env.DB, tracked.id);

      if (latest?.content_hash === contentHash) {
        processed += 1;
        continue;
      }

      const previousText =
        latest !== null ? await loadSnapshotText(env.SNAPSHOTS, latest.r2_key) : null;
      const diffSummary = summarizeDiff(previousText, rendered.text);
      const timestamp = Date.now();
      const r2Key = `snapshots/${tracked.id}/${timestamp}.txt`;

      await env.SNAPSHOTS.put(r2Key, rendered.text, {
        httpMetadata: { contentType: "text/plain; charset=utf-8" },
        customMetadata: {
          url: tracked.url,
          content_hash: contentHash,
        },
      });

      await insertSnapshot(env.DB, tracked.id, contentHash, diffSummary, r2Key);
      processed += 1;
    } catch (error) {
      errors += 1;
      console.error(`Snapshot failed for ${tracked.url}:`, error);
    }
  }

  return { processed, errors };
}
