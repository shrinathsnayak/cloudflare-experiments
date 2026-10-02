export const TEXT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_MARKDOWN_CHARS = 12_000;
export const MAX_OUTPUT_TOKENS = 1_024;
export const MARKDOWN_PREVIEW_CHARS = 500;
export const MAX_TEXT_FIELD_LENGTH = 200;
export const MAX_LINE_ITEMS = 100;
export const SUM_TOLERANCE = 0.02;

export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MIME_EXTENSIONS: Record<(typeof SUPPORTED_MIME_TYPES)[number], string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const RECEIPT_CATEGORIES = [
  "food",
  "travel",
  "lodging",
  "office",
  "software",
  "other",
] as const;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  $: "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "₹": "INR",
};
