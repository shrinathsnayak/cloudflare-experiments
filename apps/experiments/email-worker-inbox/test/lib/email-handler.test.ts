import { describe, it, expect, vi, beforeEach } from "vitest";

const storeInboxMessage = vi.fn();
const createMessageId = vi.fn(() => "msg-1");

vi.mock("../../src/lib/inbox", () => ({
  storeInboxMessage: (...args: unknown[]) => storeInboxMessage(...args),
  createMessageId: () => createMessageId(),
}));

vi.mock("postal-mime", () => ({
  default: {
    parse: vi.fn().mockResolvedValue({
      subject: "Hello there",
      text: "Body",
      html: "<p>Body</p>",
      messageId: "<id@example.com>",
    }),
  },
}));

import { handleInboundEmail } from "../../src/lib/email-handler";

describe("handleInboundEmail", () => {
  beforeEach(() => {
    storeInboxMessage.mockReset();
  });

  it("stores parsed email", async () => {
    const setReject = vi.fn();
    const message = {
      from: "sender@example.com",
      to: "inbox@example.com",
      headers: new Headers({ subject: "Hello there" }),
      raw: new ReadableStream(),
      setReject,
    } as unknown as ForwardableEmailMessage;

    await handleInboundEmail(message, { INBOX: {} as KVNamespace });
    expect(setReject).not.toHaveBeenCalled();
    expect(storeInboxMessage).toHaveBeenCalledOnce();
    const stored = storeInboxMessage.mock.calls[0][1] as { subject: string; rejected: boolean };
    expect(stored.subject).toBe("Hello there");
    expect(stored.rejected).toBe(false);
  });

  it("rejects spam and still stores", async () => {
    const setReject = vi.fn();
    const message = {
      from: "bot@spam.example",
      to: "inbox@example.com",
      headers: new Headers({ subject: "Buy now" }),
      raw: new ReadableStream(),
      setReject,
    } as unknown as ForwardableEmailMessage;

    await handleInboundEmail(message, { INBOX: {} as KVNamespace });
    expect(setReject).toHaveBeenCalled();
    const stored = storeInboxMessage.mock.calls[0][1] as { rejected: boolean };
    expect(stored.rejected).toBe(true);
  });
});
