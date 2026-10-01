import { MAX_DOMAIN_LENGTH } from "../constants/defaults";

const LABEL_PATTERN = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;
const TLD_PATTERN = /^(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Accepts a bare hostname (no scheme, path, or port); returns it lowercased without a trailing dot. */
export function validateDomain(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const domain = input.trim().toLowerCase().replace(/\.$/, "");
  if (!domain || domain.length > MAX_DOMAIN_LENGTH) return null;

  const labels = domain.split(".");
  if (labels.length < 2) return null;
  if (!labels.every((label) => LABEL_PATTERN.test(label))) return null;
  if (!TLD_PATTERN.test(labels[labels.length - 1])) return null;
  return domain;
}

export function validateEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!EMAIL_PATTERN.test(trimmed)) return null;
  return trimmed.toLowerCase();
}

export function parseId(input: string | undefined): number | null {
  if (!input || !/^\d+$/.test(input)) return null;
  const id = Number.parseInt(input, 10);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
