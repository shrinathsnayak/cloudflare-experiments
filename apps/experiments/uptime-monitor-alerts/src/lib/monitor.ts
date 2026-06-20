import type { CheckRow, MonitorHistoryResponse, MonitorRow } from "../types/monitor";
import { fetchWithTiming } from "./fetch";
import { recordAlert, sendDownAlert } from "./alerts";
import type { Env } from "../types/env";

export async function createMonitor(
  db: D1Database,
  url: string,
  alertEmail: string
): Promise<MonitorRow> {
  await db
    .prepare("INSERT INTO monitors (url, alert_email) VALUES (?, ?)")
    .bind(url, alertEmail)
    .run();
  const row = await db
    .prepare(
      "SELECT id, url, alert_email, last_status, created_at FROM monitors ORDER BY id DESC LIMIT 1"
    )
    .first<MonitorRow>();
  if (!row) {
    throw new Error("Failed to create monitor");
  }
  return row;
}

export async function getMonitor(db: D1Database, id: number): Promise<MonitorRow | null> {
  return db
    .prepare("SELECT id, url, alert_email, last_status, created_at FROM monitors WHERE id = ?")
    .bind(id)
    .first<MonitorRow>();
}

export async function deleteMonitor(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare("DELETE FROM monitors WHERE id = ?").bind(id).run();
  return (result.meta.changes ?? 0) > 0;
}

export async function listMonitors(db: D1Database): Promise<MonitorRow[]> {
  const result = await db
    .prepare("SELECT id, url, alert_email, last_status, created_at FROM monitors ORDER BY id ASC")
    .all<MonitorRow>();
  return result.results ?? [];
}

export async function getMonitorHistory(
  db: D1Database,
  id: number
): Promise<MonitorHistoryResponse | null> {
  const monitor = await getMonitor(db, id);
  if (!monitor) return null;

  const result = await db
    .prepare(
      "SELECT id, monitor_id, ok, status_code, response_time_ms, error, checked_at FROM checks WHERE monitor_id = ? ORDER BY checked_at DESC LIMIT 100"
    )
    .bind(id)
    .all<CheckRow>();

  const checks = result.results ?? [];
  const upCount = checks.filter((check) => check.ok === 1).length;
  const uptimePercent =
    checks.length === 0 ? 100 : Math.round((upCount / checks.length) * 1000) / 10;

  return {
    id: monitor.id,
    url: monitor.url,
    alertEmail: monitor.alert_email,
    uptimePercent,
    totalChecks: checks.length,
    checks: checks.map((check) => ({
      id: check.id,
      ok: check.ok === 1,
      statusCode: check.status_code,
      responseTimeMs: check.response_time_ms,
      error: check.error,
      checkedAt: new Date(check.checked_at * 1000).toISOString(),
    })),
  };
}

async function insertCheck(
  db: D1Database,
  monitorId: number,
  result: Awaited<ReturnType<typeof fetchWithTiming>>
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO checks (monitor_id, ok, status_code, response_time_ms, error) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(
      monitorId,
      result.ok ? 1 : 0,
      result.statusCode || null,
      result.responseTimeMs,
      result.error ?? null
    )
    .run();
}

async function updateMonitorStatus(
  db: D1Database,
  monitorId: number,
  status: "up" | "down"
): Promise<void> {
  await db
    .prepare("UPDATE monitors SET last_status = ? WHERE id = ?")
    .bind(status, monitorId)
    .run();
}

export async function runMonitorChecks(env: Env): Promise<{ processed: number; alerts: number }> {
  const monitors = await listMonitors(env.DB);
  let processed = 0;
  let alerts = 0;

  for (const monitor of monitors) {
    const result = await fetchWithTiming(monitor.url);
    await insertCheck(env.DB, monitor.id, result);

    const currentStatus: "up" | "down" = result.ok ? "up" : "down";
    const previousStatus = monitor.last_status as "up" | "down" | null;

    if (previousStatus === "up" && currentStatus === "down") {
      const alertResult = await sendDownAlert(env, {
        alertEmail: monitor.alert_email,
        url: monitor.url,
        statusCode: result.statusCode,
        error: result.error,
      });
      await recordAlert(
        env.DB,
        monitor.id,
        monitor.alert_email,
        alertResult.sent,
        alertResult.error
      );
      alerts += 1;
    }

    await updateMonitorStatus(env.DB, monitor.id, currentStatus);
    processed += 1;
  }

  return { processed, alerts };
}
