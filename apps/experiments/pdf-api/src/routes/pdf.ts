import { Hono } from "hono";
import type { Env } from "../types/env";
import { generatePdf } from "../lib/browser";
import { validateUrl } from "../lib/url";
import { jsonError } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/pdf", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  try {
    const pdf = await generatePdf(c.env.BROWSER, url);
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "PDF generation failed";
    return jsonError(c, message, "PDF_ERROR", 502);
  }
});

export default app;
