import { describe, it, expect, vi } from "vitest";
import { buildDigest, sendDigest } from "../../src/lib/digest";
import type { Env } from "../../src/types/env";
import { createMockDb, item } from "../helpers/mock-db";

const NOW = new Date("2026-10-01T07:00:00Z");

describe("buildDigest", () => {
  it("groups items by sender", () => {
    const digest = buildDigest(
      [
        item({ id: 1, subject: "Issue 1" }),
        item({ id: 2, from_address: "x@other.com", from_name: null, subject: "Other", link: null }),
        item({ id: 3, subject: "Issue 2" }),
      ],
      NOW
    );
    expect(digest.subject).toBe("Newsletter digest 2026-10-01: 3 items");
    expect(digest.itemCount).toBe(3);
    expect(digest.senderCount).toBe(2);
    expect(digest.text).toContain(
      "== Example News <news@example.com> ==\n\nIssue 1\n  - Point one"
    );
    expect(digest.text.indexOf("Issue 2")).toBeLessThan(digest.text.indexOf("x@other.com"));
    expect(digest.html).toContain('<a href="https://example.com/post">Read more</a>');
  });

  it("escapes HTML in subjects and summaries", () => {
    const digest = buildDigest([item({ subject: "<script>x</script>", summary: "- a & b" })], NOW);
    expect(digest.html).toContain("&lt;script&gt;x&lt;/script&gt;");
    expect(digest.html).toContain("<li>a &amp; b</li>");
    expect(digest.subject).toBe("Newsletter digest 2026-10-01: 1 item");
  });
});

describe("sendDigest", () => {
  it("sends pending items and marks them digested", async () => {
    const db = createMockDb([item({ id: 1 }), item({ id: 2, digested_at: 1 })]);
    const send = vi.fn().mockResolvedValue({ messageId: "m1" });
    const env = {
      DB: db,
      EMAIL: { send },
      DIGEST_TO: "me@example.com",
      DIGEST_FROM: "d@example.com",
    } as unknown as Env;

    expect(await sendDigest(env, NOW)).toEqual({ sent: true, itemCount: 1, messageId: "m1" });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ to: "me@example.com", from: "d@example.com" })
    );
    expect(db.items[0].digested_at).toBe(Math.floor(NOW.getTime() / 1000));

    expect(await sendDigest(env, NOW)).toEqual({ sent: false, itemCount: 0 });
    expect(send).toHaveBeenCalledOnce();
  });

  it("leaves items pending when sending fails", async () => {
    const db = createMockDb([item()]);
    const env = {
      DB: db,
      EMAIL: { send: vi.fn().mockRejectedValue(new Error("no")) },
      DIGEST_TO: "me@example.com",
    } as unknown as Env;
    await expect(sendDigest(env, NOW)).rejects.toThrow("no");
    expect(db.items[0].digested_at).toBeNull();
  });
});
