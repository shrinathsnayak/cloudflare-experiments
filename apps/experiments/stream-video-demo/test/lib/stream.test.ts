import { describe, it, expect, vi } from "vitest";
import {
  buildPlaybackUrl,
  createPlaybackToken,
  createUploadUrl,
  demoPlaybackToken,
  demoUploadUrl,
  parseMaxDurationSeconds,
  validateUid,
} from "../../src/lib/stream";
import type { StreamBinding } from "../../src/types/env";
import { DEFAULT_MAX_DURATION_SECONDS, DEMO_TOKEN, DEMO_UID } from "../../src/constants/defaults";

describe("stream lib", () => {
  it("validates uids", () => {
    expect(validateUid("abc123")).toBe("abc123");
    expect(validateUid("  abc  ")).toBe("abc");
    expect(validateUid("")).toBeNull();
    expect(validateUid("   ")).toBeNull();
    expect(validateUid(undefined)).toBeNull();
  });

  it("parses maxDurationSeconds", () => {
    expect(parseMaxDurationSeconds(undefined)).toBe(DEFAULT_MAX_DURATION_SECONDS);
    expect(parseMaxDurationSeconds({})).toBe(DEFAULT_MAX_DURATION_SECONDS);
    expect(parseMaxDurationSeconds({ maxDurationSeconds: 120 })).toBe(120);
    expect(parseMaxDurationSeconds({ maxDurationSeconds: 0 })).toBeNull();
    expect(parseMaxDurationSeconds({ maxDurationSeconds: 1.5 })).toBeNull();
    expect(parseMaxDurationSeconds({ maxDurationSeconds: "3600" })).toBeNull();
    expect(parseMaxDurationSeconds([])).toBeNull();
  });

  it("builds playback urls", () => {
    expect(buildPlaybackUrl("tok")).toBe("https://videodelivery.net/tok/manifest/video.m3u8");
  });

  it("creates live upload urls from the binding", async () => {
    const stream: StreamBinding = {
      createDirectUpload: vi.fn().mockResolvedValue({
        uploadURL: "https://upload.example/u",
        uid: "vid-1",
      }),
      video: vi.fn(),
    };

    const result = await createUploadUrl(stream, 1800);
    expect(result).toEqual({
      uploadURL: "https://upload.example/u",
      uid: "vid-1",
      mode: "live",
      maxDurationSeconds: 1800,
    });
    expect(stream.createDirectUpload).toHaveBeenCalledWith({ maxDurationSeconds: 1800 });
  });

  it("falls back to demo upload when binding throws", async () => {
    const stream: StreamBinding = {
      createDirectUpload: vi.fn().mockRejectedValue(new Error("not available")),
      video: vi.fn(),
    };

    const result = await createUploadUrl(stream, 3600);
    expect(result).toEqual(demoUploadUrl(3600));
    expect(result.mode).toBe("demo");
    expect(result.uid).toBe(DEMO_UID);
  });

  it("falls back to demo upload when createDirectUpload is missing", async () => {
    const result = await createUploadUrl({} as StreamBinding, 3600);
    expect(result.mode).toBe("demo");
  });

  it("creates live playback tokens from the binding", async () => {
    const generateToken = vi.fn().mockResolvedValue({ token: "signed-tok" });
    const stream: StreamBinding = {
      createDirectUpload: vi.fn(),
      video: vi.fn().mockReturnValue({ generateToken, update: vi.fn() }),
    };

    const result = await createPlaybackToken(stream, "vid-9");
    expect(result).toEqual({
      token: "signed-tok",
      uid: "vid-9",
      playbackUrl: buildPlaybackUrl("signed-tok"),
      mode: "live",
    });
    expect(stream.video).toHaveBeenCalledWith("vid-9");
  });

  it("falls back to demo token when generateToken throws", async () => {
    const stream: StreamBinding = {
      createDirectUpload: vi.fn(),
      video: vi.fn().mockReturnValue({
        generateToken: vi.fn().mockRejectedValue(new Error("stub")),
        update: vi.fn(),
      }),
    };

    const result = await createPlaybackToken(stream, "vid-9");
    expect(result).toEqual(demoPlaybackToken("vid-9"));
    expect(result.token).toBe(DEMO_TOKEN);
  });
});
