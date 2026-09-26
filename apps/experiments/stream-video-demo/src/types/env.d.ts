/// <reference types="@cloudflare/workers-types" />

export type StreamBinding = {
  createDirectUpload(opts: {
    maxDurationSeconds: number;
  }): Promise<{ uploadURL: string; uid: string }>;
  video(id: string): {
    generateToken(opts?: { exp?: number }): Promise<{ token: string }>;
    update(opts: { requireSignedURLs?: boolean }): Promise<unknown>;
  };
};

export interface Env {
  STREAM: StreamBinding;
}
