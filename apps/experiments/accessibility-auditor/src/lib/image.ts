import { IMAGE_FETCH_TIMEOUT_MS, MAX_IMAGE_BYTES } from "../constants/defaults";

export type ImageReadResult =
  | { ok: true; bytes: Uint8Array; contentType: string }
  | { ok: false; code: string; message: string; status: 400 | 413 | 415 | 502 };

function baseContentType(header: string | null): string {
  return (header ?? "").split(";")[0].trim().toLowerCase();
}

/** Reads an image body (request or fetch response) enforcing image/* and the byte limit. */
export async function readImageBody(
  source: Request | Response,
  maxBytes: number = MAX_IMAGE_BYTES
): Promise<ImageReadResult> {
  const contentType = baseContentType(source.headers.get("content-type"));
  if (!contentType.startsWith("image/")) {
    return {
      ok: false,
      code: "UNSUPPORTED_MEDIA_TYPE",
      message: `Expected an image/* content type, got "${contentType || "none"}"`,
      status: 415,
    };
  }
  const declared = Number(source.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    return tooLarge(maxBytes);
  }
  const bytes = new Uint8Array(await source.arrayBuffer());
  if (bytes.byteLength === 0) {
    return { ok: false, code: "MISSING_IMAGE", message: "Image body is empty", status: 400 };
  }
  if (bytes.byteLength > maxBytes) return tooLarge(maxBytes);
  return { ok: true, bytes, contentType };
}

function tooLarge(maxBytes: number): ImageReadResult {
  return {
    ok: false,
    code: "PAYLOAD_TOO_LARGE",
    message: `Image exceeds ${maxBytes} bytes`,
    status: 413,
  };
}

export async function fetchImage(url: string): Promise<ImageReadResult> {
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Image fetch failed";
    return { ok: false, code: "FETCH_ERROR", message, status: 502 };
  }
  if (!response.ok) {
    return {
      ok: false,
      code: "FETCH_ERROR",
      message: `Image fetch returned HTTP ${response.status}`,
      status: 502,
    };
  }
  return readImageBody(response);
}
