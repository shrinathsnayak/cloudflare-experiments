import { RECEIPT_CATEGORIES } from "./defaults";

const nullableNumber = { type: ["number", "null"] };
const nullableString = { type: ["string", "null"] };

export const RECEIPT_JSON_SCHEMA = {
  type: "object",
  properties: {
    vendor: nullableString,
    date: { type: ["string", "null"], description: "Purchase date as YYYY-MM-DD" },
    currency: { type: ["string", "null"], description: "ISO 4217 code, e.g. USD" },
    subtotal: nullableNumber,
    tax: nullableNumber,
    tip: nullableNumber,
    total: nullableNumber,
    lineItems: {
      type: "array",
      items: {
        type: "object",
        properties: {
          description: { type: "string" },
          quantity: nullableNumber,
          unitPrice: nullableNumber,
          amount: nullableNumber,
        },
        required: ["description", "quantity", "unitPrice", "amount"],
      },
    },
    paymentMethod: { type: ["string", "null"], description: "e.g. Visa ****1234, cash" },
    category: { type: "string", enum: [...RECEIPT_CATEGORIES] },
  },
  required: [
    "vendor",
    "date",
    "currency",
    "subtotal",
    "tax",
    "tip",
    "total",
    "lineItems",
    "paymentMethod",
    "category",
  ],
} as const;

export const EXTRACTION_SYSTEM_PROMPT = [
  "You extract structured data from receipts and invoices.",
  "The user message is the receipt converted to Markdown (images were described by a vision model).",
  "Return only values present in the receipt; use null when a field is missing. Never invent values.",
  "Amounts are plain numbers without currency symbols.",
  "Dates are YYYY-MM-DD; copy the year exactly as printed and never guess a different year.",
  "Each printed item line is one lineItems entry; do not repeat entries.",
  "category is one of: food, travel, lodging, office, software, other.",
].join(" ");
