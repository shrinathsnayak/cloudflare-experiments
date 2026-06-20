import { ALLOWED_SCHEMES } from "../constants/defaults";

export function validateUrl(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (!ALLOWED_SCHEMES.includes(url.protocol as (typeof ALLOWED_SCHEMES)[number])) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

export function validateEmail(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) return null;
  return trimmed.toLowerCase();
}

export function parseMonitorId(input: string | undefined): number | null {
  if (!input) return null;
  const id = Number.parseInt(input, 10);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}
