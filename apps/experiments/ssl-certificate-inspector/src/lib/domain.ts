const DOMAIN_RE = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export function validateDomain(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const domain = input.trim().toLowerCase().replace(/\.$/, "");
  if (!domain || domain.length > 253 || !DOMAIN_RE.test(domain)) return null;
  return domain;
}

export function daysUntil(dateIso: string): number {
  const target = new Date(dateIso).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.floor((target - Date.now()) / (1000 * 60 * 60 * 24));
}

export function uniqueSans(entries: string[]): string[] {
  return [...new Set(entries.map((entry) => entry.trim()).filter(Boolean))];
}
