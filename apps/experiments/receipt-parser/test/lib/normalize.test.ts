import { describe, it, expect } from "vitest";
import { normalizeReceipt, toCurrency, toIsoDate, toNumber } from "../../src/lib/normalize";
import { parseModelJson } from "../../src/lib/extract";

describe("toNumber", () => {
  it("coerces numbers and money strings", () => {
    expect(toNumber(12.345)).toBe(12.35);
    expect(toNumber("$1,234.50")).toBe(1234.5);
    expect(toNumber("1.234,56 €")).toBe(1234.56);
    expect(toNumber("12,5")).toBe(12.5);
    expect(toNumber("(3.00)")).toBe(-3);
    expect(toNumber("-$2.10")).toBe(-2.1);
  });

  it("returns null for unusable values", () => {
    expect(toNumber("n/a")).toBeNull();
    expect(toNumber(null)).toBeNull();
    expect(toNumber(Number.NaN)).toBeNull();
  });
});

describe("toIsoDate", () => {
  it("keeps valid ISO dates and rejects impossible ones", () => {
    expect(toIsoDate("2026-03-14")).toBe("2026-03-14");
    expect(toIsoDate("2026-03-14T10:00:00")).toBe("2026-03-14");
    expect(toIsoDate("2026-02-30")).toBeNull();
    expect(toIsoDate("not a date")).toBeNull();
  });
});

describe("toCurrency", () => {
  it("maps symbols and validates codes", () => {
    expect(toCurrency("usd")).toBe("USD");
    expect(toCurrency("€")).toBe("EUR");
    expect(toCurrency("dollars")).toBeNull();
  });
});

describe("normalizeReceipt", () => {
  it("normalizes model output and fills missing fields with null", () => {
    const receipt = normalizeReceipt({
      vendor: "  Blue Bottle  ",
      date: "2026-09-01",
      currency: "usd",
      subtotal: "9.50",
      total: 10.26,
      lineItems: [
        { description: "Latte", quantity: 2, unitPrice: "4.75" },
        { description: "", amount: 1 },
        "garbage",
      ],
      category: "FOOD",
    });

    expect(receipt).toEqual({
      vendor: "Blue Bottle",
      date: "2026-09-01",
      currency: "USD",
      subtotal: 9.5,
      tax: null,
      tip: null,
      total: 10.26,
      lineItems: [{ description: "Latte", quantity: 2, unitPrice: 4.75, amount: 9.5 }],
      paymentMethod: null,
      category: "food",
    });
  });

  it("falls back to an empty receipt for non-objects", () => {
    const receipt = normalizeReceipt("nope");
    expect(receipt.vendor).toBeNull();
    expect(receipt.lineItems).toEqual([]);
    expect(receipt.category).toBe("other");
  });
});

describe("parseModelJson", () => {
  it("accepts object, JSON string, and fenced JSON responses", () => {
    expect(parseModelJson({ response: { vendor: "A" } })).toEqual({ vendor: "A" });
    expect(parseModelJson({ response: '{"vendor":"B"}' })).toEqual({ vendor: "B" });
    expect(parseModelJson({ response: '```json\n{"vendor":"C"}\n```' })).toEqual({ vendor: "C" });
  });

  it("throws when there is no output", () => {
    expect(() => parseModelJson({})).toThrow();
  });
});
