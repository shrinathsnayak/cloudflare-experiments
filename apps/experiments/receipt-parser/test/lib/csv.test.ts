import { describe, it, expect } from "vitest";
import { csvCell, receiptToCsv } from "../../src/utils/csv";
import { normalizeReceipt } from "../../src/lib/normalize";

describe("csvCell", () => {
  it("quotes commas, quotes, and newlines", () => {
    expect(csvCell('Joe\'s "Diner", NYC')).toBe('"Joe\'s ""Diner"", NYC"');
    expect(csvCell("line\nbreak")).toBe('"line\nbreak"');
    expect(csvCell(null)).toBe("");
    expect(csvCell(-4.5)).toBe("-4.5");
  });

  it("neutralizes spreadsheet formulas in text cells", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
  });
});

describe("receiptToCsv", () => {
  it("returns a header and one CRLF-terminated row", () => {
    const receipt = normalizeReceipt({
      vendor: "Acme, Inc.",
      date: "2026-01-02",
      currency: "EUR",
      total: 42,
      lineItems: [{ description: "Widget", amount: 42 }],
      category: "office",
    });
    const csv = receiptToCsv("invoice.pdf", receipt, ["Date not found"]);
    const [header, row, trailing] = csv.split("\r\n");
    expect(header).toBe(
      "fileName,vendor,date,currency,subtotal,tax,tip,total,paymentMethod,category,lineItemCount,warnings"
    );
    expect(row).toBe('invoice.pdf,"Acme, Inc.",2026-01-02,EUR,,,,42,,office,1,Date not found');
    expect(trailing).toBe("");
  });
});
