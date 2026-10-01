import { describe, it, expect } from "vitest";
import { parseSubmission } from "../../src/lib/body";

function post(body: BodyInit, contentType?: string) {
  return new Request("http://localhost/f/x", {
    method: "POST",
    headers: contentType ? { "Content-Type": contentType } : {},
    body,
  });
}

describe("parseSubmission", () => {
  it("parses urlencoded bodies and extracts reserved fields", async () => {
    const result = await parseSubmission(
      post(
        "name=Ada&email=ada%40example.com&cf-turnstile-response=tok&_gotcha=",
        "application/x-www-form-urlencoded"
      )
    );
    expect(result).toEqual({
      ok: true,
      fields: { name: "Ada", email: "ada@example.com" },
      turnstileToken: "tok",
      honeypotFilled: false,
    });
  });

  it("parses multipart text fields and ignores files", async () => {
    const form = new FormData();
    form.append("message", "Hello");
    form.append("topic", "a");
    form.append("topic", "b");
    form.append("attachment", new Blob(["data"]), "file.txt");
    const result = await parseSubmission(
      new Request("http://localhost/", { method: "POST", body: form })
    );
    expect(result.ok && result.fields).toEqual({ message: "Hello", topic: "a, b" });
  });

  it("parses JSON objects with primitive values", async () => {
    const result = await parseSubmission(
      post(
        JSON.stringify({ name: "Ada", age: 36, subscribe: true, _gotcha: "bot" }),
        "application/json"
      )
    );
    expect(result).toMatchObject({
      ok: true,
      fields: { name: "Ada", age: "36", subscribe: "true" },
      honeypotFilled: true,
    });
  });

  it("rejects nested JSON values", async () => {
    const result = await parseSubmission(post(JSON.stringify({ a: { b: 1 } }), "application/json"));
    expect(result).toMatchObject({ ok: false, code: "INVALID_BODY" });
  });

  it("rejects unsupported content types", async () => {
    const result = await parseSubmission(post("hi", "text/plain"));
    expect(result).toMatchObject({ ok: false, code: "UNSUPPORTED_CONTENT_TYPE", status: 415 });
  });

  it("enforces the field count limit", async () => {
    const body = Object.fromEntries(Array.from({ length: 31 }, (_, i) => [`f${i}`, "x"]));
    const result = await parseSubmission(post(JSON.stringify(body), "application/json"));
    expect(result).toMatchObject({ ok: false, code: "TOO_MANY_FIELDS" });
  });

  it("enforces the field length limit", async () => {
    const result = await parseSubmission(
      post(JSON.stringify({ message: "x".repeat(5001) }), "application/json")
    );
    expect(result).toMatchObject({ ok: false, code: "FIELD_TOO_LONG" });
  });
});
