import { describe, it, expect, vi } from "vitest";
import { concatBytes, readAudio, synthesizeSpeech, validateLang } from "../../src/lib/tts";
import { cacheKey } from "../../src/lib/cache";

function stream(bytes: number[]): ReadableStream {
  return new Blob([new Uint8Array(bytes)]).stream();
}

describe("readAudio", () => {
  it("reads streams and byte arrays", async () => {
    expect(await readAudio(stream([0xff, 0xf3, 1]))).toEqual(new Uint8Array([0xff, 0xf3, 1]));
    const raw = new Uint8Array([1, 2]);
    expect(await readAudio(raw)).toBe(raw);
  });

  it("throws when there is no audio", async () => {
    await expect(readAudio({})).rejects.toThrow("TTS model returned no audio");
    await expect(readAudio(stream([]))).rejects.toThrow("TTS model returned no audio");
  });
});

describe("synthesizeSpeech", () => {
  it("synthesizes chunks with the language's model and concatenates in order", async () => {
    const run = vi
      .fn()
      .mockImplementationOnce(async () => stream([1, 2]))
      .mockImplementationOnce(async () => stream([3]));
    const ai = { run } as unknown as Ai;
    const audio = await synthesizeSpeech(ai, ["Hola.", "Adiós."], "es");
    expect(audio).toEqual(new Uint8Array([1, 2, 3]));
    expect(run).toHaveBeenNthCalledWith(1, "@cf/deepgram/aura-2-es", {
      text: "Hola.",
      encoding: "mp3",
    });
  });

  it("concatBytes joins arrays", () => {
    expect(concatBytes([new Uint8Array([1]), new Uint8Array([2, 3])])).toEqual(
      new Uint8Array([1, 2, 3])
    );
  });
});

describe("validateLang", () => {
  it("defaults to en and rejects unsupported languages", () => {
    expect(validateLang(undefined)).toBe("en");
    expect(validateLang("ES")).toBe("es");
    expect(validateLang("fr")).toBeNull();
  });
});

describe("cacheKey", () => {
  it("is stable and varies by lang and model", async () => {
    const a = await cacheKey("https://example.com/a", "en", "@cf/deepgram/aura-2-en");
    const b = await cacheKey("https://example.com/a", "en", "@cf/deepgram/aura-2-en");
    const c = await cacheKey("https://example.com/a", "es", "@cf/deepgram/aura-2-es");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^audio\/[0-9a-f]{64}\.mp3$/);
  });
});
