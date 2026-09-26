import {
  DEFAULT_MAX_DURATION_SECONDS,
  DEMO_TOKEN,
  DEMO_UID,
  DEMO_UPLOAD_URL,
  MAX_MAX_DURATION_SECONDS,
  MIN_MAX_DURATION_SECONDS,
  PLAYBACK_HOST,
} from "../constants/defaults";
import type { StreamBinding } from "../types/env";
import type { PlaybackTokenResponse, UploadUrlBody, UploadUrlResponse } from "../types/stream";

export function validateUid(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  return trimmed;
}

/**
 * Parse optional POST body for /upload-url.
 * Returns default duration when body is empty or maxDurationSeconds is omitted.
 * Returns null when the body or maxDurationSeconds is invalid.
 */
export function parseMaxDurationSeconds(body: unknown): number | null {
  if (body === undefined || body === null || body === "") {
    return DEFAULT_MAX_DURATION_SECONDS;
  }

  if (typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const { maxDurationSeconds } = body as UploadUrlBody;
  if (maxDurationSeconds === undefined) {
    return DEFAULT_MAX_DURATION_SECONDS;
  }

  if (typeof maxDurationSeconds !== "number" || !Number.isFinite(maxDurationSeconds)) {
    return null;
  }

  if (
    !Number.isInteger(maxDurationSeconds) ||
    maxDurationSeconds < MIN_MAX_DURATION_SECONDS ||
    maxDurationSeconds > MAX_MAX_DURATION_SECONDS
  ) {
    return null;
  }

  return maxDurationSeconds;
}

export function buildPlaybackUrl(token: string): string {
  return `${PLAYBACK_HOST}/${token}/manifest/video.m3u8`;
}

export function demoUploadUrl(maxDurationSeconds: number): UploadUrlResponse {
  return {
    uploadURL: DEMO_UPLOAD_URL,
    uid: DEMO_UID,
    mode: "demo",
    maxDurationSeconds,
  };
}

export function demoPlaybackToken(uid: string): PlaybackTokenResponse {
  return {
    token: DEMO_TOKEN,
    uid,
    playbackUrl: buildPlaybackUrl(DEMO_TOKEN),
    mode: "demo",
  };
}

function hasCreateDirectUpload(stream: StreamBinding | undefined): stream is StreamBinding {
  return typeof stream?.createDirectUpload === "function";
}

function hasVideo(stream: StreamBinding | undefined): stream is StreamBinding {
  return typeof stream?.video === "function";
}

/**
 * Create a Stream direct upload URL via the Workers binding.
 * Falls back to demo values when the binding is missing, stubbed, or throws (e.g. local wrangler).
 */
export async function createUploadUrl(
  stream: StreamBinding | undefined,
  maxDurationSeconds: number
): Promise<UploadUrlResponse> {
  if (!hasCreateDirectUpload(stream)) {
    return demoUploadUrl(maxDurationSeconds);
  }

  try {
    const result = await stream.createDirectUpload({ maxDurationSeconds });
    const uid = result.uid || (result as { uploadURL: string; uid?: string; id?: string }).id || "";
    if (!result.uploadURL || !uid) {
      return demoUploadUrl(maxDurationSeconds);
    }
    return {
      uploadURL: result.uploadURL,
      uid,
      mode: "live",
      maxDurationSeconds,
    };
  } catch {
    return demoUploadUrl(maxDurationSeconds);
  }
}

/**
 * Generate a signed Stream playback token for a video uid.
 * Falls back to demo values when the binding is missing, stubbed, or throws.
 */
export async function createPlaybackToken(
  stream: StreamBinding | undefined,
  uid: string,
  exp?: number
): Promise<PlaybackTokenResponse> {
  if (!hasVideo(stream)) {
    return demoPlaybackToken(uid);
  }

  try {
    const handle = stream.video(uid);
    if (typeof handle?.generateToken !== "function") {
      return demoPlaybackToken(uid);
    }
    const result = await handle.generateToken(exp !== undefined ? { exp } : undefined);
    if (!result?.token) {
      return demoPlaybackToken(uid);
    }
    return {
      token: result.token,
      uid,
      playbackUrl: buildPlaybackUrl(result.token),
      mode: "live",
    };
  } catch {
    return demoPlaybackToken(uid);
  }
}
