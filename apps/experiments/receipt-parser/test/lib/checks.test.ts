import { describe, it, expect } from "vitest";
import { checkReceipt } from "../../src/lib/checks";
import type { Receipt } from "../../src/types/receipt";

function receipt(overrides: Partial<Receipt> = {}): Receipt {
  return {
    vendor: "Cafe",
    date: "2026-09-01",
    currency: "USD",
    subtotal: 10,
    tax: 0.8,
    tip: 2,
    total: 12.8,
    lineItems: [
      { description: "Sandwich", quantity: 1, unitPrice: 7, amount: 7 },
      { description: "Coffee", quantity: 1, unitPrice: 3, amount: 3 },
    ],
    paymentMethod: "Visa",
    category: "food",
    ...overrides,
  };
}

describe("checkReceipt", () => {
  it("returns no warnings for a consistent receipt", () => {
    expect(checkReceipt(receipt())).toEqual([]);
  });

  it("warns when line items don't sum to subtotal", () => {
    const warnings = checkReceipt(receipt({ subtotal: 11, total: 13.8 }));
    expect(warnings).toEqual(["Line items don't sum to subtotal (10.00 vs 11.00)"]);
  });

  it("warns when subtotal + tax + tip doesn't match total", () => {
    const warnings = checkReceipt(receipt({ total: 15 }));
    expect(warnings).toEqual(["Subtotal plus tax and tip doesn't match total (12.80 vs 15.00)"]);
  });

  it("checks line items against total when subtotal is missing", () => {
    const warnings = checkReceipt(receipt({ subtotal: null, total: 20 }));
    expect(warnings).toEqual(["Line items plus tax and tip don't sum to total (12.80 vs 20.00)"]);
  });

  it("tolerates cent-level rounding", () => {
    expect(checkReceipt(receipt({ subtotal: 10.01, total: 12.81 }))).toEqual([]);
  });

  it("flags missing core fields", () => {
    const warnings = checkReceipt(receipt({ vendor: null, date: null, total: null }));
    expect(warnings).toContain("Vendor not found");
    expect(warnings).toContain("Date not found or invalid");
    expect(warnings).toContain("Total not found");
  });
});
