import {
  CURRENCY_SYMBOLS,
  MAX_LINE_ITEMS,
  MAX_TEXT_FIELD_LENGTH,
  RECEIPT_CATEGORIES,
} from "../constants/defaults";
import type { LineItem, Receipt, ReceiptCategory } from "../types/receipt";

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Coerces numbers and money strings like "$1,234.56", "1.234,56 €", or "(3.00)" to numbers. */
export function toNumber(value: unknown, decimals = 2): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? roundTo(value, decimals) : null;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  const negative = /^\(.*\)$/.test(trimmed) || /^[^\d]*-/.test(trimmed) || /-$/.test(trimmed);
  let digits = trimmed.replace(/[^0-9.,]/g, "");
  if (!/\d/.test(digits)) return null;

  if (/^\d{1,3}(\.\d{3})*,\d{1,2}$/.test(digits) || /^\d+,\d{1,2}$/.test(digits)) {
    digits = digits.replace(/\./g, "").replace(",", ".");
  } else {
    digits = digits.replace(/,/g, "");
  }

  const parsed = Number(digits);
  if (!Number.isFinite(parsed)) return null;
  return roundTo(negative ? -parsed : parsed, decimals);
}

function isValidYmd(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** Returns an ISO date (YYYY-MM-DD) or null. */
export function toIsoDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (iso) {
    const [, y, m, d] = iso;
    return isValidYmd(Number(y), Number(m), Number(d)) ? `${y}-${m}-${d}` : null;
  }
  const parsed = Date.parse(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10);
}

export function toText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed ? trimmed.slice(0, MAX_TEXT_FIELD_LENGTH) : null;
}

export function toCurrency(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (CURRENCY_SYMBOLS[trimmed]) return CURRENCY_SYMBOLS[trimmed];
  const code = trimmed.toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : null;
}

export function toCategory(value: unknown): ReceiptCategory {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return (RECEIPT_CATEGORIES as readonly string[]).includes(normalized)
    ? (normalized as ReceiptCategory)
    : "other";
}

function toLineItem(value: unknown): LineItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const description = toText(item.description);
  if (!description) return null;

  const quantity = toNumber(item.quantity, 3);
  const unitPrice = toNumber(item.unitPrice);
  let amount = toNumber(item.amount);
  if (amount === null && quantity !== null && unitPrice !== null) {
    amount = roundTo(quantity * unitPrice, 2);
  }
  return { description, quantity, unitPrice, amount };
}

/** Normalizes untrusted model output into a Receipt; anything unusable becomes null. */
export function normalizeReceipt(raw: unknown): Receipt {
  const input = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const lineItems = Array.isArray(input.lineItems)
    ? input.lineItems
        .map(toLineItem)
        .filter((item): item is LineItem => item !== null)
        .slice(0, MAX_LINE_ITEMS)
    : [];

  return {
    vendor: toText(input.vendor),
    date: toIsoDate(input.date),
    currency: toCurrency(input.currency),
    subtotal: toNumber(input.subtotal),
    tax: toNumber(input.tax),
    tip: toNumber(input.tip),
    total: toNumber(input.total),
    lineItems,
    paymentMethod: toText(input.paymentMethod),
    category: toCategory(input.category),
  };
}
