import { DEFAULT_ALERT_FROM } from "../constants/defaults";
import type { Env } from "../types/env";
import type { DomainRow, DomainStatus, ExpiryKind, ReminderCheckSummary } from "../types/domain";
import { checkDomain, dueThreshold } from "./expiry";
import { hasReminder, listDomains, recordReminder, saveDomainStatus } from "./store";

const KIND_LABEL: Record<ExpiryKind, string> = {
  registration: "domain registration",
  certificate: "TLS certificate",
};

export function buildReminderEmail(
  domain: string,
  kind: ExpiryKind,
  expiresAt: string,
  daysLeft: number
): { subject: string; text: string } {
  const label = KIND_LABEL[kind];
  const when =
    daysLeft < 0
      ? "has expired"
      : daysLeft === 0
        ? "expires today"
        : `expires in ${daysLeft} day(s)`;
  return {
    subject: `${domain}: ${label} ${when}`,
    text: [
      `The ${label} for ${domain} ${when}.`,
      "",
      `Expires at: ${expiresAt}`,
      "",
      "Sent by the domain-expiry-reminder experiment.",
    ].join("\n"),
  };
}

async function remindIfDue(
  env: Env,
  row: DomainRow,
  kind: ExpiryKind,
  info: { expiresAt: string; daysLeft: number } | null
): Promise<boolean> {
  if (!info) return false;
  const threshold = dueThreshold(info.daysLeft);
  if (threshold === null) return false;
  if (await hasReminder(env.DB, row.id, kind, threshold, info.expiresAt)) return false;

  const { subject, text } = buildReminderEmail(row.domain, kind, info.expiresAt, info.daysLeft);
  await env.EMAIL.send({
    from: env.ALERT_FROM_EMAIL?.trim() || DEFAULT_ALERT_FROM,
    to: row.alert_email,
    subject,
    text,
  });
  await recordReminder(env.DB, row.id, kind, threshold, info.expiresAt);
  return true;
}

export async function processDomain(
  env: Env,
  row: DomainRow,
  status: DomainStatus
): Promise<number> {
  await saveDomainStatus(env.DB, row.id, status);
  let sent = 0;
  if (await remindIfDue(env, row, "registration", status.registration)) sent += 1;
  if (await remindIfDue(env, row, "certificate", status.certificate)) sent += 1;
  return sent;
}

export async function runReminderChecks(env: Env, now = Date.now()): Promise<ReminderCheckSummary> {
  const rows = await listDomains(env.DB);
  const summary: ReminderCheckSummary = { processed: 0, remindersSent: 0, failures: 0 };

  for (const row of rows) {
    try {
      const status = await checkDomain(row.domain, now);
      summary.remindersSent += await processDomain(env, row, status);
    } catch (error) {
      summary.failures += 1;
      console.error(`Reminder check failed for ${row.domain}`, error);
    }
    summary.processed += 1;
  }

  return summary;
}
