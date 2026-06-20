import { DEFAULT_ALERT_FROM } from "../constants/defaults";
import type { Env } from "../types/env";

export async function sendDownAlert(
  env: Env,
  params: { alertEmail: string; url: string; statusCode: number; error?: string }
): Promise<{ sent: boolean; error?: string }> {
  const from = env.ALERT_FROM_EMAIL?.trim() || DEFAULT_ALERT_FROM;
  const subject = `Monitor alert: ${params.url} is down`;
  const details = params.error
    ? `Error: ${params.error}`
    : `HTTP status: ${params.statusCode || "unknown"}`;
  const text = [
    "Your uptime monitor detected a down transition.",
    "",
    `URL: ${params.url}`,
    details,
    "",
    "This alert was sent by the uptime-monitor-alerts experiment.",
  ].join("\n");

  try {
    await env.EMAILER.send({
      from,
      to: params.alertEmail,
      subject,
      text,
    });
    return { sent: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send alert email";
    return { sent: false, error: message };
  }
}

export async function recordAlert(
  db: D1Database,
  monitorId: number,
  alertEmail: string,
  sent: boolean,
  error?: string
): Promise<void> {
  await db
    .prepare("INSERT INTO alerts (monitor_id, alert_email, sent, error) VALUES (?, ?, ?, ?)")
    .bind(monitorId, alertEmail, sent ? 1 : 0, error ?? null)
    .run();
}
