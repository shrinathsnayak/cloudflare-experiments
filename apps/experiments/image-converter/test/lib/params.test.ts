import { describe, it, expect, vi } from "vitest";
import { parseConvertOptions } from "../../src/lib/params";
import { readImageBody } from "../../src/lib/input";
import { toImagesFailure } from "../../src/lib/images";
import { validateUrl } from "../../src/lib/url";

function parse(query: Record<string, string>) {
  return parseConvertOptions((key) => query[key]);
}

describe("parseConvertOptions", () => {
  it("defaults to webp", () => {
    expect(parse({})).toEqual({ ok: true, value: { format: "webp" } });
  });

  it("parses all options and normalizes jpg", () => {
    expect(
      parse({ format: "JPG", quality: "75", width: "800", height: "600", fit: "cover" })
    ).toEqual({
      ok: true,
      value: { format: "jpeg", quality: 75, width: 800, height: 600, fit: "cover" },
    });
  });

  it.each([
    [{ format: "gif" }, "INVALID_FORMAT"],
    [{ quality: "0" }, "INVALID_QUALITY"],
    [{ quality: "101" }, "INVALID_QUALITY"],
    [{ quality: "8.5" }, "INVALID_QUALITY"],
    [{ width: "0" }, "INVALID_DIMENSIONS"],
    [{ height: "5000" }, "INVALID_DIMENSIONS"],
    [{ width: "abc" }, "INVALID_DIMENSIONS"],
    [{ fit: "cover" }, "INVALID_DIMENSIONS"],
    [{ width: "100", fit: "stretch" }, "INVALID_FIT"],
  ])("rejects %j with %s", (query, code) => {
    const result = parse(query);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe(code);
  });
});

describe("readImageBody", () => {
  it("rejects non-image content types with 415", async () => {
    const result = await readImageBody(
      new Request("http://x", {
        method: "POST",
        body: "hi",
        headers: { "content-type": "text/plain" },
      })
    );
    expect(result).toMatchObject({ ok: false, code: "UNSUPPORTED_MEDIA_TYPE", status: 415 });
  });

  it("rejects oversized bodies with 413", async () => {
    const result = await readImageBody(
      new Request("http://x", {
        method: "POST",
        body: new Uint8Array(11),
        headers: { "content-type": "image/png" },
      }),
      10
    );
    expect(result).toMatchObject({ ok: false, code: "PAYLOAD_TOO_LARGE", status: 413 });
  });

  it("rejects empty bodies", async () => {
    const result = await readImageBody(
      new Request("http://x", { method: "POST", headers: { "content-type": "image/png" } })
    );
    expect(result).toMatchObject({ ok: false, code: "MISSING_IMAGE" });
  });
});

describe("toImagesFailure", () => {
  it("maps not-an-image errors to 415 and others to 502", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const notImage = Object.assign(new Error("not an image"), { code: 9412 });
    expect(toImagesFailure(notImage)).toMatchObject({
      code: "UNSUPPORTED_MEDIA_TYPE",
      status: 415,
    });
    expect(toImagesFailure(new Error("boom"))).toMatchObject({ code: "IMAGES_ERROR", status: 502 });
  });
});

describe("validateUrl", () => {
  it("accepts http(s) only", () => {
    expect(validateUrl("https://example.com/a.png")).toBe("https://example.com/a.png");
    expect(validateUrl("data:image/png;base64,AAA")).toBeNull();
  });
});
