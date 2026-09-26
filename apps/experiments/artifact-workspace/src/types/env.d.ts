/// <reference types="@cloudflare/workers-types" />

/**
 * Artifacts-style workspace API. This experiment implements it on R2 until a
 * stable Cloudflare Artifacts binding ships.
 */
export interface ArtifactStore {
  put(path: string, data: string | ArrayBuffer): Promise<void>;
  get(path: string): Promise<ReadableStream | null>;
  list(prefix?: string): Promise<{ path: string }[]>;
  /** Extension for DELETE /files; not part of all Artifacts APIs. */
  delete(path: string): Promise<void>;
}

export interface Env {
  ARTIFACTS: R2Bucket;
}
