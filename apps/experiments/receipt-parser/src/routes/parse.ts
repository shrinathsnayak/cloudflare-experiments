import { Hono } from "hono";
import type { Env } from "../types/env";
import type { ParseResponse } from "../types/receipt";
import { MARKDOWN_PREVIEW_CHARS } from "../constants/defaults";
import { readUpload } from "../lib/upload";
import { convertToMarkdown } from "../lib/convert";
import { extractReceiptFields } from "../lib/extract";
import { normalizeReceipt } from "../lib/normalize";
import { checkReceipt } from "../lib/checks";
import { receiptToCsv } from "../utils/csv";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/parse", async (c) => {
  const format = c.req.query("format") ?? "json";
  if (format !== "json" && format !== "csv") {
    return jsonError(c, "Query parameter format must be 'json' or 'csv'", "INVALID_QUERY");
  }

  const upload = await readUpload(c.req.raw, c.req.query("name"));
  if (!upload.ok) {
    return jsonError(c, upload.message, upload.code, upload.status);
  }
  const { file } = upload;

  let markdown: string;
  try {
    markdown = await convertToMarkdown(c.env.AI, file);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Markdown conversion failed";
    return jsonError(c, message, "CONVERSION_ERROR", 502);
  }

  let raw: unknown;
  try {
    raw = await extractReceiptFields(c.env.AI, markdown);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Field extraction failed";
    return jsonError(c, message, "AI_ERROR", 502);
  }

  const receipt = normalizeReceipt(raw);
  const warnings = checkReceipt(receipt);

  if (format === "csv") {
    return c.body(receiptToCsv(file.name, receipt, warnings), 200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="receipt.csv"',
    });
  }

  const response: ParseResponse = {
    fileName: file.name,
    mimeType: file.mimeType,
    markdownPreview: markdown.slice(0, MARKDOWN_PREVIEW_CHARS),
    receipt,
    warnings,
  };
  return jsonSuccess(c, response);
});

export default app;
