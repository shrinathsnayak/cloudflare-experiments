import { SUM_TOLERANCE } from "../constants/defaults";
import type { Receipt } from "../types/receipt";
import { roundTo } from "./normalize";

function differs(a: number, b: number): boolean {
  return Math.abs(a - b) > SUM_TOLERANCE;
}

function money(value: number): string {
  return value.toFixed(2);
}

/** Sanity-checks a normalized receipt and returns human-readable warnings. */
export function checkReceipt(receipt: Receipt): string[] {
  const warnings: string[] = [];
  const { lineItems, subtotal, tax, tip, total } = receipt;

  if (!receipt.vendor) warnings.push("Vendor not found");
  if (!receipt.date) warnings.push("Date not found or invalid");
  if (total === null) warnings.push("Total not found");

  const amounts = lineItems.map((item) => item.amount);
  if (amounts.some((amount) => amount === null)) {
    warnings.push("Some line items have no amount");
  }

  const known = amounts.filter((amount): amount is number => amount !== null);
  if (known.length > 0 && known.length === amounts.length) {
    const itemsSum = roundTo(
      known.reduce((sum, amount) => sum + amount, 0),
      2
    );
    if (subtotal !== null && differs(itemsSum, subtotal)) {
      warnings.push(`Line items don't sum to subtotal (${money(itemsSum)} vs ${money(subtotal)})`);
    } else if (subtotal === null && total !== null) {
      const expected = roundTo(itemsSum + (tax ?? 0) + (tip ?? 0), 2);
      if (differs(expected, total)) {
        warnings.push(
          `Line items plus tax and tip don't sum to total (${money(expected)} vs ${money(total)})`
        );
      }
    }
  }

  if (subtotal !== null && total !== null) {
    const expected = roundTo(subtotal + (tax ?? 0) + (tip ?? 0), 2);
    if (differs(expected, total)) {
      warnings.push(
        `Subtotal plus tax and tip doesn't match total (${money(expected)} vs ${money(total)})`
      );
    }
  }

  return warnings;
}
