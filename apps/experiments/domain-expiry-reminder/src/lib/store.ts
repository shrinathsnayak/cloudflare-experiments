import type { DomainRow, DomainStatus, ExpiryKind } from "../types/domain";

const DOMAIN_COLUMNS =
  "id, domain, alert_email, registration_expires_at, certificate_expires_at, last_checked_at, created_at";

export async function createDomain(
  db: D1Database,
  domain: string,
  alertEmail: string
): Promise<DomainRow> {
  const row = await db
    .prepare(`INSERT INTO domains (domain, alert_email) VALUES (?, ?) RETURNING ${DOMAIN_COLUMNS}`)
    .bind(domain, alertEmail)
    .first<DomainRow>();
  if (!row) throw new Error("Failed to create domain");
  return row;
}

export async function getDomain(db: D1Database, id: number): Promise<DomainRow | null> {
  return db
    .prepare(`SELECT ${DOMAIN_COLUMNS} FROM domains WHERE id = ?`)
    .bind(id)
    .first<DomainRow>();
}

export async function listDomains(db: D1Database): Promise<DomainRow[]> {
  const result = await db
    .prepare(`SELECT ${DOMAIN_COLUMNS} FROM domains ORDER BY id ASC`)
    .all<DomainRow>();
  return result.results ?? [];
}

export async function deleteDomain(db: D1Database, id: number): Promise<boolean> {
  await db.prepare("DELETE FROM reminders WHERE domain_id = ?").bind(id).run();
  const result = await db.prepare("DELETE FROM domains WHERE id = ?").bind(id).run();
  return (result.meta.changes ?? 0) > 0;
}

export async function saveDomainStatus(
  db: D1Database,
  id: number,
  status: DomainStatus
): Promise<void> {
  await db
    .prepare(
      "UPDATE domains SET registration_expires_at = ?, certificate_expires_at = ?, last_checked_at = ? WHERE id = ?"
    )
    .bind(
      status.registration?.expiresAt ?? null,
      status.certificate?.expiresAt ?? null,
      Math.floor(Date.parse(status.checkedAt) / 1000),
      id
    )
    .run();
}

export async function hasReminder(
  db: D1Database,
  domainId: number,
  kind: ExpiryKind,
  thresholdDays: number,
  expiresAt: string
): Promise<boolean> {
  const row = await db
    .prepare(
      "SELECT id FROM reminders WHERE domain_id = ? AND kind = ? AND threshold_days = ? AND expires_at = ?"
    )
    .bind(domainId, kind, thresholdDays, expiresAt)
    .first<{ id: number }>();
  return row !== null;
}

export async function recordReminder(
  db: D1Database,
  domainId: number,
  kind: ExpiryKind,
  thresholdDays: number,
  expiresAt: string
): Promise<void> {
  await db
    .prepare(
      "INSERT OR IGNORE INTO reminders (domain_id, kind, threshold_days, expires_at) VALUES (?, ?, ?, ?)"
    )
    .bind(domainId, kind, thresholdDays, expiresAt)
    .run();
}
