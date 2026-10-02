import { describe, it, expect, vi, beforeEach } from "vitest";
import worker from "../../src/index";
import listenRoutes from "../../src/routes/listen";
import textRoutes from "../../src/routes/text";
import { fetchArticle, NotHtmlError } from "../../src/lib/extract";
import type { Env } from "../../src/types/env";

vi.mock("../../src/lib/extract", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/lib/extract")>();
  return { ...actual, fetchArticle: vi.fn() };
});

const mockedFetchArticle = vi.mocked(fetchArticle);

function mp3Stream() {
  return new Blob([new TextEncoder().encode("mp3-bytes")]).stream();
}

function createEnv(run = vi.fn().mockImplementation(async () => mp3Stream())) {
  const store = new Map<string, Uint8Array>();
  const bucket = {
    get: vi.fn(async (key: string) => {
      const bytes = store.get(key);
      return bytes ? { body: new Blob([bytes]).stream(), size: bytes.length } : null;
    }),
    put: vi.fn(async (key: string, value: Uint8Array) => {
      store.set(key, value);
    }),
  };
  const env = { AI: { run }, AUDIO_CACHE: bucket } as unknown as Env;
  return { env, run, bucket, store };
}

const ARTICLE_URL = "https://example.com/post";

beforeEach(() => {
  mockedFetchArticle.mockReset();
  mockedFetchArticle.mockResolvedValue({
    title: "A Post",
    text: "This is the first sentence. This is the second sentence.",
  });
});

describe("GET /listen", () => {
  it("returns INVALID_URL for missing or non-http urls", async () => {
    const { env } = createEnv();
    for (const query of ["", "?url=ftp://example.com"]) {
      const res = await listenRoutes.fetch(new Request(`http://localhost/listen${query}`), env);
      expect(res.status).toBe(400);
      expect(((await res.json()) as { code: string }).code).toBe("INVALID_URL");
    }
  });

  it("returns INVALID_LANG for unsupported languages", async () => {
    const { env } = createEnv();
    const res = await listenRoutes.fetch(
      new Request(`http://localhost/listen?url=${ARTICLE_URL}&lang=xx`),
      env
    );
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe("INVALID_LANG");
  });

  it("synthesizes on MISS, caches in R2, and serves HIT next time", async () => {
    const { env, run, bucket } = createEnv();
    const request = () => new Request(`http://localhost/listen?url=${ARTICLE_URL}&lang=es`);

    const first = await listenRoutes.fetch(request(), env);
    expect(first.status).toBe(200);
    expect(first.headers.get("Content-Type")).toBe("audio/mpeg");
    expect(first.headers.get("X-Cache")).toBe("MISS");
    expect(await first.text()).toBe("mp3-bytes");
    expect(run).toHaveBeenCalledWith("@cf/deepgram/aura-2-es", {
      text: "This is the first sentence. This is the second sentence.",
      encoding: "mp3",
    });
    expect(bucket.put).toHaveBeenCalledTimes(1);

    const second = await listenRoutes.fetch(request(), env);
    expect(second.headers.get("X-Cache")).toBe("HIT");
    expect(await second.text()).toBe("mp3-bytes");
    expect(run).toHaveBeenCalledTimes(1);
    expect(mockedFetchArticle).toHaveBeenCalledTimes(1);
  });

  it("returns FETCH_ERROR when the page can't be fetched", async () => {
    mockedFetchArticle.mockRejectedValueOnce(new Error("Upstream responded with HTTP 500"));
    const { env } = createEnv();
    const res = await listenRoutes.fetch(
      new Request(`http://localhost/listen?url=${ARTICLE_URL}`),
      env
    );
    expect(res.status).toBe(502);
    expect(((await res.json()) as { code: string }).code).toBe("FETCH_ERROR");
  });

  it("returns NO_CONTENT when no article text is found", async () => {
    mockedFetchArticle.mockResolvedValueOnce({ title: null, text: "" });
    const { env, run } = createEnv();
    const res = await listenRoutes.fetch(
      new Request(`http://localhost/listen?url=${ARTICLE_URL}`),
      env
    );
    expect(res.status).toBe(404);
    expect(((await res.json()) as { code: string }).code).toBe("NO_CONTENT");
    expect(run).not.toHaveBeenCalled();
  });

  it("returns TTS_ERROR when synthesis fails", async () => {
    const { env, bucket } = createEnv(vi.fn().mockRejectedValue(new Error("model overloaded")));
    const res = await listenRoutes.fetch(
      new Request(`http://localhost/listen?url=${ARTICLE_URL}`),
      env
    );
    expect(res.status).toBe(502);
    expect(((await res.json()) as { code: string }).code).toBe("TTS_ERROR");
    expect(bucket.put).not.toHaveBeenCalled();
  });
});

describe("GET /text", () => {
  it("returns extracted text and chunk info", async () => {
    const { env } = createEnv();
    const res = await textRoutes.fetch(
      new Request(`http://localhost/text?url=${ARTICLE_URL}`),
      env
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { title: string; chars: number; chunks: number };
    expect(body.title).toBe("A Post");
    expect(body.chunks).toBe(1);
    expect(body.chars).toBe(56);
  });

  it("returns NO_CONTENT (400) for non-HTML pages", async () => {
    mockedFetchArticle.mockRejectedValueOnce(new NotHtmlError("Expected an HTML page"));
    const { env } = createEnv();
    const res = await textRoutes.fetch(
      new Request(`http://localhost/text?url=${ARTICLE_URL}`),
      env
    );
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe("NO_CONTENT");
  });

  it("is mounted on the worker", async () => {
    const res = await worker.fetch(new Request("http://localhost/text"));
    expect(res.status).toBe(400);
  });
});
