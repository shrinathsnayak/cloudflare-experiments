import { describe, it, expect, vi } from "vitest";
import streamRoutes from "../../src/routes/stream";
import type { Env, StreamBinding } from "../../src/types/env";
import { DEMO_UID, DEMO_UPLOAD_URL } from "../../src/constants/defaults";

function envWith(stream: StreamBinding): Env {
  return { STREAM: stream };
}

describe("stream routes", () => {
  it("returns INVALID_UID when uid is missing", async () => {
    const res = await streamRoutes.fetch(
      new Request("http://localhost/playback-token"),
      envWith({} as StreamBinding)
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_UID");
  });

  it("returns INVALID_BODY for bad maxDurationSeconds", async () => {
    const res = await streamRoutes.fetch(
      new Request("http://localhost/upload-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ maxDurationSeconds: -1 }),
      }),
      envWith({} as StreamBinding)
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_BODY");
  });

  it("returns live upload URL from STREAM binding", async () => {
    const createDirectUpload = vi.fn().mockResolvedValue({
      uploadURL: "https://upload.cloudflarestream.com/abc",
      uid: "uid-live",
    });
    const env = envWith({
      createDirectUpload,
      video: vi.fn(),
    });

    const res = await streamRoutes.fetch(
      new Request("http://localhost/upload-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ maxDurationSeconds: 600 }),
      }),
      env
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      uploadURL: string;
      uid: string;
      mode: string;
      maxDurationSeconds: number;
    };
    expect(body.uploadURL).toBe("https://upload.cloudflarestream.com/abc");
    expect(body.uid).toBe("uid-live");
    expect(body.mode).toBe("live");
    expect(body.maxDurationSeconds).toBe(600);
    expect(createDirectUpload).toHaveBeenCalledWith({ maxDurationSeconds: 600 });
  });

  it("returns demo upload URL when STREAM methods are missing", async () => {
    const res = await streamRoutes.fetch(
      new Request("http://localhost/upload-url", { method: "POST" }),
      envWith({} as StreamBinding)
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      uploadURL: string;
      uid: string;
      mode: string;
    };
    expect(body.mode).toBe("demo");
    expect(body.uid).toBe(DEMO_UID);
    expect(body.uploadURL).toBe(DEMO_UPLOAD_URL);
  });

  it("returns live playback token from STREAM binding", async () => {
    const generateToken = vi.fn().mockResolvedValue({ token: "tok-live" });
    const env = envWith({
      createDirectUpload: vi.fn(),
      video: vi.fn().mockReturnValue({ generateToken, update: vi.fn() }),
    });

    const res = await streamRoutes.fetch(
      new Request("http://localhost/playback-token?uid=vid-42"),
      env
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      token: string;
      uid: string;
      playbackUrl: string;
      mode: string;
    };
    expect(body.token).toBe("tok-live");
    expect(body.uid).toBe("vid-42");
    expect(body.mode).toBe("live");
    expect(body.playbackUrl).toContain("tok-live");
  });

  it("returns demo playback token when STREAM throws", async () => {
    const env = envWith({
      createDirectUpload: vi.fn(),
      video: vi.fn().mockReturnValue({
        generateToken: vi.fn().mockRejectedValue(new Error("unavailable")),
        update: vi.fn(),
      }),
    });

    const res = await streamRoutes.fetch(
      new Request("http://localhost/playback-token?uid=vid-42"),
      env
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { mode: string; uid: string };
    expect(body.mode).toBe("demo");
    expect(body.uid).toBe("vid-42");
  });
});
