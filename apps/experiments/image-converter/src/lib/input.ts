import { FETCH_TIMEOUT_MS, MAX_IMAGE_BYTES } from "../constants/defaults";
import type { ImageBytes, ParseResult } from "../types/image";

function baseContentType(header: string | null): string {
  return (header ?? "").split(";")[0].trim().toLowerCase();
}

function tooLarge(maxBytes: number): ParseResult<never> {
  return {
    ok: false,
    code: "PAYLOAD_TOO_LARGE",
    message: `Image exceeds ${maxBytes} bytes`,
    status: 413,
  };
}

/** Reads an image body (incoming request or fetch response), enforcing image/* and a byte limit. */
export async function readImageBody(
  source: Request | Response,
  maxBytes: number = MAX_IMAGE_BYTES
): Promise<ParseResult<ImageBytes>> {
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
  if (Number.isFinite(declared) && declared > maxBytes) return tooLarge(maxBytes);

  const bytes = new Uint8Array(await source.arrayBuffer());
  if (bytes.byteLength === 0) {
    return { ok: false, code: "MISSING_IMAGE", message: "Image body is empty", status: 400 };
  }
  if (bytes.byteLength > maxBytes) return tooLarge(maxBytes);
  return { ok: true, value: { bytes, contentType } };
}

export async function fetchRemoteImage(url: string): Promise<ParseResult<ImageBytes>> {
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
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

export function toStream(bytes: Uint8Array): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}
