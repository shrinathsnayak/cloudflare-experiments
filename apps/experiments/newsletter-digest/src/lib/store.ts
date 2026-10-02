import { ITEMS_PAGE_SIZE, MAX_DIGEST_ITEMS } from "../constants/defaults";
import type { ItemRow, NewItem } from "../types/digest";

const ITEM_COLUMNS =
  "id, from_address, from_name, subject, summary, link, received_at, digested_at";

export async function insertItem(db: D1Database, item: NewItem): Promise<number> {
  const row = await db
    .prepare(
      "INSERT INTO items (from_address, from_name, subject, summary, link) VALUES (?, ?, ?, ?, ?) RETURNING id"
    )
    .bind(item.fromAddress, item.fromName, item.subject, item.summary, item.link)
    .first<{ id: number }>();
  if (!row) throw new Error("Failed to store item");
  return row.id;
}

export async function listItems(db: D1Database, pendingOnly: boolean): Promise<ItemRow[]> {
  const where = pendingOnly ? "WHERE digested_at IS NULL " : "";
  const result = await db
    .prepare(`SELECT ${ITEM_COLUMNS} FROM items ${where}ORDER BY received_at DESC, id DESC LIMIT ?`)
    .bind(ITEMS_PAGE_SIZE)
    .all<ItemRow>();
  return result.results ?? [];
}

export async function listPendingForDigest(db: D1Database): Promise<ItemRow[]> {
  const result = await db
    .prepare(
      `SELECT ${ITEM_COLUMNS} FROM items WHERE digested_at IS NULL ORDER BY received_at ASC, id ASC LIMIT ?`
    )
    .bind(MAX_DIGEST_ITEMS)
    .all<ItemRow>();
  return result.results ?? [];
}

export async function markDigested(db: D1Database, ids: number[], at: number): Promise<void> {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => "?").join(", ");
  await db
    .prepare(`UPDATE items SET digested_at = ? WHERE id IN (${placeholders})`)
    .bind(at, ...ids)
    .run();
}
