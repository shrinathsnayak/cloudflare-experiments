import type { Receipt } from "../types/receipt";

export const CSV_COLUMNS = [
  "fileName",
  "vendor",
  "date",
  "currency",
  "subtotal",
  "tax",
  "tip",
  "total",
  "paymentMethod",
  "category",
  "lineItemCount",
  "warnings",
] as const;

/** RFC 4180 quoting, plus a leading quote on text cells that spreadsheets would run as formulas. */
export function csvCell(value: string | number | null): string {
  if (value === null) return "";
  if (typeof value === "number") return String(value);
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** Returns a header line and a single data row (CRLF-terminated) for spreadsheets. */
export function receiptToCsv(fileName: string, receipt: Receipt, warnings: string[]): string {
  const row: Record<(typeof CSV_COLUMNS)[number], string | number | null> = {
    fileName,
    vendor: receipt.vendor,
    date: receipt.date,
    currency: receipt.currency,
    subtotal: receipt.subtotal,
    tax: receipt.tax,
    tip: receipt.tip,
    total: receipt.total,
    paymentMethod: receipt.paymentMethod,
    category: receipt.category,
    lineItemCount: receipt.lineItems.length,
    warnings: warnings.length ? warnings.join("; ") : null,
  };
  const header = CSV_COLUMNS.join(",");
  const values = CSV_COLUMNS.map((column) => csvCell(row[column])).join(",");
  return `${header}\r\n${values}\r\n`;
}
