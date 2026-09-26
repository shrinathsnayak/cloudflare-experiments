import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

const store = new Map<string, string>();

const put = vi.fn(async (key: string, value: string | ArrayBuffer) => {
  store.set(key, typeof value === "string" ? value : new TextDecoder().decode(value));
});

const get = vi.fn(async (key: string) => {
  const value = store.get(key);
  if (value === undefined) return null;
  return {
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(value));
        controller.close();
      },
    }),
  };
});

const list = vi.fn(async (opts?: { prefix?: string }) => {
  const prefix = opts?.prefix ?? "";
  const objects = [...store.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key }));
  return { objects };
});

const del = vi.fn(async (key: string) => {
  store.delete(key);
});

const mockEnv = {
  ARTIFACTS: { put, get, list, delete: del } as unknown as R2Bucket,
};

describe("files routes", () => {
  it("PUT then GET returns stored content", async () => {
    store.clear();

    const putRes = await worker.fetch(
      new Request("http://localhost/files?path=notes/hello.txt", {
        method: "PUT",
        body: "hello world",
      }),
      mockEnv
    );
    expect(putRes.status).toBe(200);

    const getRes = await worker.fetch(
      new Request("http://localhost/files?path=notes/hello.txt"),
      mockEnv
    );
    expect(getRes.status).toBe(200);
    expect(await getRes.text()).toBe("hello world");
  });

  it("GET /files/list returns paths", async () => {
    store.clear();
    store.set("a/one.txt", "1");
    store.set("a/two.txt", "2");
    store.set("b/three.txt", "3");

    const res = await worker.fetch(new Request("http://localhost/files/list?prefix=a/"), mockEnv);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { files: { path: string }[] };
    expect(body.files.map((f) => f.path).sort()).toEqual(["a/one.txt", "a/two.txt"]);
  });

  it("DELETE removes a file", async () => {
    store.clear();
    store.set("gone.txt", "x");

    const res = await worker.fetch(
      new Request("http://localhost/files?path=gone.txt", { method: "DELETE" }),
      mockEnv
    );
    expect(res.status).toBe(200);
    expect(store.has("gone.txt")).toBe(false);
  });

  it("rejects invalid path", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/files?path=../etc/passwd", {
        method: "PUT",
        body: "nope",
      }),
      mockEnv
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_PATH");
  });

  it("returns 404 for missing file", async () => {
    store.clear();
    const res = await worker.fetch(new Request("http://localhost/files?path=missing.txt"), mockEnv);
    expect(res.status).toBe(404);
  });
});
