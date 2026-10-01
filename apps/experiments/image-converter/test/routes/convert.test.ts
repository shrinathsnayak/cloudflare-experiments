import { describe, it, expect, vi, afterEach } from "vitest";
import worker from "../../src/index";
import type { Env } from "../../src/types/env";

const OUTPUT = new Uint8Array([1, 2, 3, 4]);

function createImagesMock(options: { outputError?: unknown } = {}) {
  const transformer = {
    transform: vi.fn(),
    draw: vi.fn(),
    output: vi.fn(async (opts: { format: string }) => {
      if (options.outputError) throw options.outputError;
      return {
        response: () => new Response(OUTPUT, { headers: { "content-type": opts.format } }),
        contentType: () => opts.format,
        image: () => new Blob([OUTPUT]).stream(),
      };
    }),
  };
  transformer.transform.mockReturnValue(transformer);
  transformer.draw.mockReturnValue(transformer);

  const images = {
    input: vi.fn().mockReturnValue(transformer),
    info: vi
      .fn()
      .mockResolvedValue({ format: "image/jpeg", fileSize: 10, width: 640, height: 480 }),
  };
  const env = { IMAGES: images as unknown as ImagesBinding } satisfies Env;
  return { env, images, transformer };
}

function upload(path: string, size = 10, contentType = "image/jpeg") {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": contentType },
    body: new Uint8Array(size),
  });
}

describe("POST /convert", () => {
  it("converts an uploaded image and reports sizes", async () => {
    const { env, transformer } = createImagesMock();
    const res = await worker.fetch(
      upload("/convert?format=avif&quality=60&width=320&fit=cover"),
      env
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/avif");
    expect(res.headers.get("x-original-size")).toBe("10");
    expect(res.headers.get("x-output-size")).toBe("4");
    expect(res.headers.get("x-size-saved-percent")).toBe("60.0");
    expect(res.headers.get("x-original-format")).toBe("image/jpeg");
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(OUTPUT);
    expect(transformer.transform).toHaveBeenCalledWith({
      width: 320,
      height: undefined,
      fit: "cover",
    });
    expect(transformer.output).toHaveBeenCalledWith({ format: "image/avif", quality: 60 });
  });

  it("skips transform without dimensions and drops quality for png", async () => {
    const { env, transformer } = createImagesMock();
    const res = await worker.fetch(upload("/convert?format=png&quality=50"), env);
    expect(res.status).toBe(200);
    expect(transformer.transform).not.toHaveBeenCalled();
    expect(transformer.output).toHaveBeenCalledWith({ format: "image/png", quality: undefined });
  });

  it("validates params before reading the body", async () => {
    const { env, images } = createImagesMock();
    const res = await worker.fetch(upload("/convert?format=bmp"), env);
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe("INVALID_FORMAT");
    expect(images.input).not.toHaveBeenCalled();
  });

  it("rejects non-image uploads", async () => {
    const { env } = createImagesMock();
    const res = await worker.fetch(upload("/convert", 10, "application/pdf"), env);
    expect(res.status).toBe(415);
    expect(((await res.json()) as { code: string }).code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("rejects uploads over 10MB", async () => {
    const { env } = createImagesMock();
    const res = await worker.fetch(upload("/convert", 10 * 1024 * 1024 + 1), env);
    expect(res.status).toBe(413);
    expect(((await res.json()) as { code: string }).code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("returns IMAGES_ERROR without leaking internals when the binding fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { env } = createImagesMock({ outputError: new Error("transform failed") });
    const res = await worker.fetch(upload("/convert"), env);
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "Image processing failed", code: "IMAGES_ERROR" });
  });
});

describe("GET /convert", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("requires a valid url", async () => {
    const { env } = createImagesMock();
    const res = await worker.fetch(new Request("http://localhost/convert?url=ftp://x"), env);
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe("INVALID_URL");
  });

  it("converts a remote image", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(new Uint8Array(8), { headers: { "content-type": "image/png" } })
      );
    vi.stubGlobal("fetch", fetchMock);
    const { env } = createImagesMock();
    const res = await worker.fetch(
      new Request("http://localhost/convert?url=https://example.com/a.png&format=jpeg"),
      env
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/jpeg");
    expect(res.headers.get("x-original-size")).toBe("8");
    expect(fetchMock.mock.calls[0][0]).toBe("https://example.com/a.png");
  });

  it("returns FETCH_ERROR when the remote image is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 404 })));
    const { env } = createImagesMock();
    const res = await worker.fetch(
      new Request("http://localhost/convert?url=https://example.com/missing.png"),
      env
    );
    expect(res.status).toBe(502);
    expect(((await res.json()) as { code: string }).code).toBe("FETCH_ERROR");
  });
});

describe("POST /watermark", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("requires watermarkUrl", async () => {
    const { env } = createImagesMock();
    const res = await worker.fetch(upload("/watermark"), env);
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe("INVALID_URL");
  });

  it("draws the overlay bottom-right at 0.6 opacity", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(new Uint8Array(3), { headers: { "content-type": "image/png" } })
        )
    );
    const { env, transformer } = createImagesMock();
    const res = await worker.fetch(
      upload("/watermark?watermarkUrl=https://example.com/logo.png&format=webp"),
      env
    );
    expect(res.status).toBe(200);
    expect(transformer.draw).toHaveBeenCalledWith(expect.anything(), {
      opacity: 0.6,
      bottom: 16,
      right: 16,
    });
  });
});

describe("POST /info", () => {
  it("returns format, size and dimensions", async () => {
    const { env } = createImagesMock();
    const res = await worker.fetch(upload("/info"), env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      format: "image/jpeg",
      fileSize: 10,
      width: 640,
      height: 480,
    });
  });

  it("handles SVG info without dimensions", async () => {
    const { env, images } = createImagesMock();
    images.info.mockResolvedValue({ format: "image/svg+xml" });
    const res = await worker.fetch(upload("/info", 20, "image/svg+xml"), env);
    expect(await res.json()).toEqual({
      format: "image/svg+xml",
      fileSize: 20,
      width: null,
      height: null,
    });
  });

  it("maps ImagesError 9412 to UNSUPPORTED_MEDIA_TYPE", async () => {
    const { env, images } = createImagesMock();
    images.info.mockImplementation(async () => {
      throw Object.assign(new Error("Input is not an image"), { code: 9412 });
    });
    const res = await worker.fetch(upload("/info"), env);
    expect(res.status).toBe(415);
    expect(((await res.json()) as { code: string }).code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });
});
