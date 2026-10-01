import { MAX_FILE_BYTES, MIME_EXTENSIONS } from "../constants/defaults";
import type { SupportedMimeType, UploadResult } from "../types/receipt";

const MULTIPART_OVERHEAD_BYTES = 64 * 1024;

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((byte, i) => bytes[offset + i] === byte);
}

/** Detects the file type from magic bytes so a wrong or missing Content-Type doesn't matter. */
export function detectMimeType(data: ArrayBuffer): SupportedMimeType | null {
  const bytes = new Uint8Array(data, 0, Math.min(data.byteLength, 12));
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46])) return "application/pdf";
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return "image/webp";
  }
  return null;
}

function sanitizeFileName(name: string | null | undefined): string | null {
  const cleaned = (name ?? "")
    .replace(/[^\w.\- ]+/g, "")
    .trim()
    .slice(0, 100);
  return cleaned || null;
}

/** Reads a receipt from a raw request body or a multipart `file` field. */
export async function readUpload(request: Request, nameParam?: string): Promise<UploadResult> {
  const tooLarge = {
    ok: false,
    code: "PAYLOAD_TOO_LARGE",
    message: `File exceeds the ${MAX_FILE_BYTES / (1024 * 1024)}MB limit`,
    status: 413,
  } as const;
  const missing = {
    ok: false,
    code: "MISSING_FILE",
    message: "Send the receipt as the raw request body or as multipart field 'file'",
    status: 400,
  } as const;

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_FILE_BYTES + MULTIPART_OVERHEAD_BYTES) return tooLarge;

  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
  let data: ArrayBuffer;
  let name: string | null;

  if (contentType.startsWith("multipart/form-data")) {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return missing;
    }
    // workers-types declares FormData.get() as string | null, but file fields are File at runtime.
    const field: unknown = form.get("file");
    if (!(field instanceof File)) return missing;
    data = await field.arrayBuffer();
    name = sanitizeFileName(field.name);
  } else {
    data = await request.arrayBuffer();
    name = sanitizeFileName(nameParam);
  }

  if (data.byteLength === 0) return missing;
  if (data.byteLength > MAX_FILE_BYTES) return tooLarge;

  const mimeType = detectMimeType(data);
  if (!mimeType) {
    return {
      ok: false,
      code: "UNSUPPORTED_MEDIA_TYPE",
      message: "Unsupported file type. Use PDF, JPEG, PNG, or WebP",
      status: 415,
    };
  }

  return {
    ok: true,
    file: { name: name ?? `receipt.${MIME_EXTENSIONS[mimeType]}`, mimeType, data },
  };
}
