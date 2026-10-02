import type { Context } from "hono";
import type { ConvertedImage, ErrorStatus, Failure } from "../types/image";

export function jsonError(
  c: Context,
  message: string,
  code: string,
  status: 404 | ErrorStatus = 400
) {
  return c.json({ error: message, code }, { status });
}

export function jsonFailure(c: Context, failure: Failure) {
  return jsonError(c, failure.message, failure.code, failure.status);
}

export function jsonSuccess<T>(c: Context, data: T, status: 200 = 200) {
  return c.json(data, { status });
}

export function imageResponse(image: ConvertedImage, originalContentType: string): Response {
  const savedPercent =
    image.originalSize > 0
      ? (((image.originalSize - image.outputSize) / image.originalSize) * 100).toFixed(1)
      : "0";
  return new Response(image.body, {
    headers: {
      "Content-Type": image.contentType,
      "X-Original-Format": originalContentType,
      "X-Original-Size": String(image.originalSize),
      "X-Output-Size": String(image.outputSize),
      "X-Size-Saved-Percent": savedPercent,
      "Cache-Control": "no-store",
    },
  });
}
