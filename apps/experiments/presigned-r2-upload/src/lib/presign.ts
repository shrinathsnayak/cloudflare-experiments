import { AwsClient } from "aws4fetch";
import type { Env } from "../types/env";
import { ALLOWED_CONTENT_TYPES, MAX_FILE_BYTES, PRESIGN_TTL_SECONDS } from "../constants/defaults";

export function validateFilename(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 128 || trimmed.includes("..") || trimmed.includes("/")) {
    return null;
  }
  return trimmed.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function validateContentType(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const type = input.trim().toLowerCase();
  return ALLOWED_CONTENT_TYPES.includes(type as (typeof ALLOWED_CONTENT_TYPES)[number])
    ? type
    : null;
}

export async function createPresignedPutUrl(
  env: Env,
  key: string,
  contentType: string
): Promise<string> {
  if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_ACCOUNT_ID) {
    throw new Error(
      "Missing R2 credentials (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID)"
    );
  }

  const client = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    service: "s3",
    region: "auto",
  });

  const bucket = env.R2_BUCKET_NAME || "presigned-r2-upload";
  const objectUrl = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucket}/${key}?X-Amz-Expires=${PRESIGN_TTL_SECONDS}`;

  const signed = await client.sign(
    new Request(objectUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
    }),
    { aws: { signQuery: true } }
  );

  return signed.url;
}

export { MAX_FILE_BYTES, PRESIGN_TTL_SECONDS };
