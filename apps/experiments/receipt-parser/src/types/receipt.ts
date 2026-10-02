import type { RECEIPT_CATEGORIES, SUPPORTED_MIME_TYPES } from "../constants/defaults";

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];
export type ReceiptCategory = (typeof RECEIPT_CATEGORIES)[number];

export interface LineItem {
  description: string;
  quantity: number | null;
  unitPrice: number | null;
  amount: number | null;
}

export interface Receipt {
  vendor: string | null;
  /** ISO date (YYYY-MM-DD) */
  date: string | null;
  /** ISO 4217 code */
  currency: string | null;
  subtotal: number | null;
  tax: number | null;
  tip: number | null;
  total: number | null;
  lineItems: LineItem[];
  paymentMethod: string | null;
  category: ReceiptCategory;
}

export interface UploadedFile {
  name: string;
  mimeType: SupportedMimeType;
  data: ArrayBuffer;
}

export type UploadErrorCode = "MISSING_FILE" | "PAYLOAD_TOO_LARGE" | "UNSUPPORTED_MEDIA_TYPE";

export type UploadResult =
  | { ok: true; file: UploadedFile }
  | { ok: false; code: UploadErrorCode; message: string; status: 400 | 413 | 415 };

export interface ParseResponse {
  fileName: string;
  mimeType: SupportedMimeType;
  markdownPreview: string;
  receipt: Receipt;
  warnings: string[];
}
