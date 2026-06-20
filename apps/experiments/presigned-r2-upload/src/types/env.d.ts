/// <reference types="@cloudflare/workers-types" />

export interface Env {
  UPLOADS: R2Bucket;
  R2_ACCOUNT_ID: string;
  R2_BUCKET_NAME: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
}

export type PresignResponse = {
  uploadUrl: string;
  key: string;
  contentType: string;
  maxBytes: number;
  expiresInSeconds: number;
};
