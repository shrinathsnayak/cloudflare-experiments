import { Hono } from "hono";
import type { Env } from "./types/env";
import parseRoutes from "./routes/parse";
import { MAX_FILE_BYTES, SUPPORTED_MIME_TYPES } from "./constants/defaults";

const app = new Hono<{ Bindings: Env }>();

app.route("/", parseRoutes);

app.get("/", (c) => {
  return c.json({
    name: "receipt-parser",
    description:
      "Parse receipts and invoices into structured JSON with Workers AI Markdown Conversion and JSON mode",
    usage: "POST /parse with a PDF or image body (or multipart field 'file'); ?format=csv for CSV",
    supportedTypes: SUPPORTED_MIME_TYPES,
    maxFileBytes: MAX_FILE_BYTES,
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
