import { MAX_PATH_LENGTH, PATH_PATTERN } from "../constants/defaults";
import type { ArtifactStore } from "../types/env";

export function validatePath(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_PATH_LENGTH) return null;
  if (trimmed.includes("..")) return null;
  if (!PATH_PATTERN.test(trimmed)) return null;
  return trimmed;
}

/** R2-backed ArtifactStore for the Artifacts-style workspace demo. */
export function createR2ArtifactStore(bucket: R2Bucket): ArtifactStore {
  return {
    async put(path: string, data: string | ArrayBuffer): Promise<void> {
      await bucket.put(path, data);
    },

    async get(path: string): Promise<ReadableStream | null> {
      const object = await bucket.get(path);
      return object?.body ?? null;
    },

    async list(prefix?: string): Promise<{ path: string }[]> {
      const listed = await bucket.list({ prefix: prefix || undefined });
      return listed.objects.map((obj) => ({ path: obj.key }));
    },

    async delete(path: string): Promise<void> {
      await bucket.delete(path);
    },
  };
}
