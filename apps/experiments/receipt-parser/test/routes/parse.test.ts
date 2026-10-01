import { describe, it, expect, vi } from "vitest";
import parseRoutes from "../../src/routes/parse";
import { detectMimeType } from "../../src/lib/upload";
import type { Env } from "../../src/types/env";

const PDF_BYTES = new TextEncoder().encode("%PDF-1.7 fake receipt");
const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

function bytes(view: Uint8Array): ArrayBuffer {
  return view.slice().buffer as ArrayBuffer;
}

const MODEL_OUTPUT = {
  vendor: "Corner Cafe",
  date: "2026-09-01",
  currency: "USD",
  subtotal: 8,
  tax: 0.64,
  tip: null,
  total: 8.64,
  lineItems: [
    { description: "Bagel", quantity: 2, unitPrice: 2.5, amount: 5 },
    { description: "Tea", quantity: 1, unitPrice: 2, amount: 2 },
  ],
  paymentMethod: "Visa ****4242",
  category: "food",
};

function createEnv(
  overrides: { toMarkdown?: ReturnType<typeof vi.fn>; run?: ReturnType<typeof vi.fn> } = {}
) {
  const toMarkdown =
    overrides.toMarkdown ??
    vi.fn().mockResolvedValue({
      id: "1",
      name: "receipt.pdf",
      mimeType: "application/pdf",
      format: "markdown",
      tokens: 10,
      data: "# Corner Cafe\nBagel x2 5.00\nTea 2.00\nTotal 8.64",
    });
  const run = overrides.run ?? vi.fn().mockResolvedValue({ response: MODEL_OUTPUT });
  const env = { AI: { toMarkdown, run } } as unknown as Env;
  return { env, toMarkdown, run };
}

function post(body: BodyInit, query = "", headers: Record<string, string> = {}) {
  return new Request(`http://localhost/parse${query}`, { method: "POST", body, headers });
}

describe("detectMimeType", () => {
  it("sniffs supported file signatures", () => {
    expect(detectMimeType(bytes(PDF_BYTES))).toBe("application/pdf");
    expect(detectMimeType(bytes(PNG_BYTES))).toBe("image/png");
    expect(detectMimeType(bytes(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])))).toBe("image/jpeg");
    expect(detectMimeType(bytes(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 ")))).toBe(
      "image/webp"
    );
    expect(detectMimeType(bytes(new TextEncoder().encode("hello")))).toBeNull();
  });
});

describe("POST /parse", () => {
  it("returns MISSING_FILE for an empty body", async () => {
    const { env } = createEnv();
    const res = await parseRoutes.fetch(post(""), env);
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe("MISSING_FILE");
  });

  it("returns UNSUPPORTED_MEDIA_TYPE for unknown file types", async () => {
    const { env, toMarkdown } = createEnv();
    const res = await parseRoutes.fetch(
      post("just text", "", { "Content-Type": "text/plain" }),
      env
    );
    expect(res.status).toBe(415);
    expect(((await res.json()) as { code: string }).code).toBe("UNSUPPORTED_MEDIA_TYPE");
    expect(toMarkdown).not.toHaveBeenCalled();
  });

  it("returns PAYLOAD_TOO_LARGE when Content-Length exceeds the limit", async () => {
    const { env } = createEnv();
    const res = await parseRoutes.fetch(
      post(PDF_BYTES, "", { "Content-Length": String(20 * 1024 * 1024) }),
      env
    );
    expect(res.status).toBe(413);
    expect(((await res.json()) as { code: string }).code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("parses a raw PDF body into a structured receipt", async () => {
    const { env, toMarkdown, run } = createEnv();
    const res = await parseRoutes.fetch(
      post(PDF_BYTES, "?name=lunch.pdf", { "Content-Type": "application/pdf" }),
      env
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      fileName: string;
      mimeType: string;
      markdownPreview: string;
      receipt: { vendor: string; total: number; lineItems: unknown[] };
      warnings: string[];
    };
    expect(body.fileName).toBe("lunch.pdf");
    expect(body.mimeType).toBe("application/pdf");
    expect(body.markdownPreview).toContain("Corner Cafe");
    expect(body.receipt.vendor).toBe("Corner Cafe");
    expect(body.receipt.lineItems).toHaveLength(2);
    expect(body.warnings).toEqual(["Line items don't sum to subtotal (7.00 vs 8.00)"]);

    const [doc] = toMarkdown.mock.calls[0] as [{ name: string; blob: Blob }];
    expect(doc.name).toBe("lunch.pdf");
    expect(doc.blob.type).toBe("application/pdf");
    expect(run).toHaveBeenCalledWith(
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      expect.objectContaining({
        response_format: expect.objectContaining({ type: "json_schema" }),
      })
    );
  });

  it("accepts a multipart file field", async () => {
    const { env } = createEnv();
    const form = new FormData();
    form.append("file", new File([PNG_BYTES], "photo.png", { type: "image/png" }));
    const res = await parseRoutes.fetch(post(form), env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { fileName: string; mimeType: string };
    expect(body.fileName).toBe("photo.png");
    expect(body.mimeType).toBe("image/png");
  });

  it("returns CSV when format=csv", async () => {
    const { env } = createEnv();
    const res = await parseRoutes.fetch(post(PDF_BYTES, "?format=csv"), env);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    const csv = await res.text();
    expect(csv.split("\r\n")[1]).toContain("Corner Cafe");
  });

  it("returns CONVERSION_ERROR when toMarkdown reports an error", async () => {
    const { env, run } = createEnv({
      toMarkdown: vi.fn().mockResolvedValue({
        id: "1",
        name: "receipt.pdf",
        mimeType: "application/pdf",
        format: "error",
        error: "Corrupt PDF",
      }),
    });
    const res = await parseRoutes.fetch(post(PDF_BYTES), env);
    expect(res.status).toBe(502);
    const body = (await res.json()) as { code: string; error: string };
    expect(body.code).toBe("CONVERSION_ERROR");
    expect(body.error).toBe("Corrupt PDF");
    expect(run).not.toHaveBeenCalled();
  });

  it("returns AI_ERROR when the model fails", async () => {
    const { env } = createEnv({
      run: vi.fn().mockRejectedValue(new Error("JSON Mode couldn't be met")),
    });
    const res = await parseRoutes.fetch(post(PDF_BYTES), env);
    expect(res.status).toBe(502);
    expect(((await res.json()) as { code: string }).code).toBe("AI_ERROR");
  });

  it("retries once when the model returns truncated JSON", async () => {
    const run = vi
      .fn()
      .mockResolvedValueOnce({ response: '{"vendor":"Corner' })
      .mockResolvedValueOnce({ response: MODEL_OUTPUT });
    const { env } = createEnv({ run });
    const res = await parseRoutes.fetch(post(PDF_BYTES), env);
    expect(res.status).toBe(200);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("rejects unknown formats", async () => {
    const { env } = createEnv();
    const res = await parseRoutes.fetch(post(PDF_BYTES, "?format=xml"), env);
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe("INVALID_QUERY");
  });
});
