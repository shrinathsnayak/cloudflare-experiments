import { REMINDER_THRESHOLDS_DAYS } from "../constants/defaults";
import type { DomainStatus, ExpiryKind } from "../types/domain";
import { lookupCertificate } from "./crtsh";
import { lookupRegistration } from "./rdap";

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysUntil(expiresAt: string, now = Date.now()): number {
  return Math.floor((Date.parse(expiresAt) - now) / DAY_MS);
}

/** Smallest threshold that `daysLeft` has crossed, or null when still outside every window. */
export function dueThreshold(
  daysLeft: number,
  thresholds: readonly number[] = REMINDER_THRESHOLDS_DAYS
): number | null {
  const crossed = thresholds.filter((t) => daysLeft <= t);
  return crossed.length ? Math.min(...crossed) : null;
}

export async function checkDomain(domain: string, now = Date.now()): Promise<DomainStatus> {
  const [registration, certificate] = await Promise.all([
    lookupRegistration(domain, now),
    lookupCertificate(domain, now),
  ]);

  const status: DomainStatus = {
    domain,
    checkedAt: new Date(now).toISOString(),
    registration: registration.data
      ? { ...registration.data, daysLeft: daysUntil(registration.data.expiresAt, now) }
      : null,
    certificate: certificate.data
      ? { ...certificate.data, daysLeft: daysUntil(certificate.data.expiresAt, now) }
      : null,
  };

  const errors: Partial<Record<ExpiryKind, string>> = {};
  if (registration.error) errors.registration = registration.error;
  if (certificate.error) errors.certificate = certificate.error;
  if (Object.keys(errors).length) status.errors = errors;

  return status;
}
