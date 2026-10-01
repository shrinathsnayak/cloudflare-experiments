import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Env } from "../../src/types/env";
import { createMockDb } from "../helpers/mock-db";

const parse = vi.fn();
vi.mock("postal-mime", () => ({ default: { parse: (...args: unknown[]) => parse(...args) } }));

import { handleNewsletter } from "../../src/lib/email-handler";

function message(overrides: Partial<ForwardableEmailMessage> = {}) {
  return {
    from: "me@gmail.com",
    to: "digest@example.com",
    headers: new Headers(),
    raw: new Response("raw email").body,
    rawSize: 2048,
    setReject: vi.fn(),
    ...overrides,
  } as unknown as ForwardableEmailMessage;
}

describe("handleNewsletter", () => {
  let db: ReturnType<typeof createMockDb>;
  let run: ReturnType<typeof vi.fn>;
  const env = (overrides: Partial<Env> = {}) =>
    ({ DB: db, AI: { run }, ALLOWED_SENDERS: "", ...overrides }) as unknown as Env;

  beforeEach(() => {
    db = createMockDb();
    run = vi.fn().mockResolvedValue({ response: "- Big news\n- Small news" });
    parse.mockReset();
    parse.mockResolvedValue({
      from: { name: "Example News", address: "News@Example.com" },
      subject: "Issue #42",
      html: '<p>Hello <b>readers</b></p><a href="https://example.com/42">Read</a>',
    });
  });

  it("parses, summarizes, and stores the newsletter", async () => {
    const result = await handleNewsletter(message(), env());
    expect(result).toEqual({ status: "stored", id: 1 });
    expect(db.items[0]).toMatchObject({
      from_address: "news@example.com",
      from_name: "Example News",
      subject: "Issue #42",
      summary: "- Big news\n- Small news",
      link: "https://example.com/42",
    });
    const prompt = run.mock.calls[0][1].messages[1].content as string;
    expect(prompt).toContain("Hello readers");
  });

  it("rejects messages over 1 MB without parsing", async () => {
    const msg = message({ rawSize: 2 * 1024 * 1024 });
    const result = await handleNewsletter(msg, env());
    expect(result.status).toBe("rejected");
    expect(msg.setReject).toHaveBeenCalled();
    expect(parse).not.toHaveBeenCalled();
  });

  it("ignores senders outside ALLOWED_SENDERS", async () => {
    const result = await handleNewsletter(message(), env({ ALLOWED_SENDERS: "substack.com" }));
    expect(result.status).toBe("ignored");
    expect(db.items).toHaveLength(0);
    expect(run).not.toHaveBeenCalled();
  });

  it("allows forwarded mail when the From header matches", async () => {
    const result = await handleNewsletter(message(), env({ ALLOWED_SENDERS: "example.com" }));
    expect(result.status).toBe("stored");
  });

  it("stores a text fallback when AI fails", async () => {
    run.mockRejectedValue(new Error("AI down"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    await handleNewsletter(message(), env());
    expect(db.items[0].summary).toBe("Hello readers Read");
  });
});
