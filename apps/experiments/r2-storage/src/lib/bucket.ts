import type { Env } from "../types/env";

export function getBucket(env: Env, publicBucket: string | undefined): R2Bucket {
  if (publicBucket === "true" || publicBucket === "1") {
    return env.PUBLIC_BUCKET;
  }
  return env.BUCKET;
}

/** Returns the public URL for a key when PUBLIC_BUCKET_URL is set and bucket is public. */
export function getPublicUrl(env: Env, key: string, usePublicBucket: boolean): string | undefined {
  if (!usePublicBucket || !env.PUBLIC_BUCKET_URL) return undefined;
  const base = env.PUBLIC_BUCKET_URL.replace(/\/$/, "");
  const path = key
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `${base}/${path}`;
}

export function isPublicParam(q: string | undefined): boolean {
  return q === "true" || q === "1";
}
