import { DEFAULT_DIGEST_FROM } from "../constants/defaults";
import type { Env } from "../types/env";
import type { Digest, DigestRunResult, ItemRow } from "../types/digest";
import { escapeHtml } from "../utils/html";
import { listPendingForDigest, markDigested } from "./store";

function senderLabel(item: ItemRow): string {
  return item.from_name ? `${item.from_name} <${item.from_address}>` : item.from_address;
}

export function groupBySender(items: ItemRow[]): Map<string, ItemRow[]> {
  const groups = new Map<string, ItemRow[]>();
  for (const item of items) {
    const key = senderLabel(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
}

function summaryLines(summary: string): string[] {
  return summary
    .split("\n")
    .map((line) => line.trim().replace(/^- /, ""))
    .filter(Boolean);
}

export function buildDigest(items: ItemRow[], now = new Date()): Digest {
  const date = now.toISOString().slice(0, 10);
  const groups = groupBySender(items);
  const subject = `Newsletter digest ${date}: ${items.length} item${items.length === 1 ? "" : "s"}`;

  const textParts: string[] = [subject, ""];
  const htmlParts: string[] = [`<h1 style="font-size:20px">${escapeHtml(subject)}</h1>`];

  for (const [sender, senderItems] of groups) {
    textParts.push(`== ${sender} ==`, "");
    htmlParts.push(`<h2 style="font-size:16px;margin-top:24px">${escapeHtml(sender)}</h2>`);

    for (const item of senderItems) {
      const lines = summaryLines(item.summary);
      textParts.push(item.subject, ...lines.map((l) => `  - ${l}`));
      if (item.link) textParts.push(`  ${item.link}`);
      textParts.push("");

      htmlParts.push(
        `<h3 style="font-size:14px;margin-bottom:4px">${escapeHtml(item.subject)}</h3>`,
        `<ul>${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>`
      );
      if (item.link) {
        htmlParts.push(`<p><a href="${escapeHtml(item.link)}">Read more</a></p>`);
      }
    }
  }

  return {
    subject,
    text: textParts.join("\n").trim(),
    html: `<!doctype html><html><body style="font-family:sans-serif;max-width:640px">${htmlParts.join("")}</body></html>`,
    itemCount: items.length,
    senderCount: groups.size,
  };
}

export async function previewDigest(env: Env, now = new Date()): Promise<Digest> {
  return buildDigest(await listPendingForDigest(env.DB), now);
}

/** Items are marked digested only after the send succeeds, so a failed send is retried next run. */
export async function sendDigest(env: Env, now = new Date()): Promise<DigestRunResult> {
  const to = env.DIGEST_TO?.trim();
  if (!to) throw new Error("DIGEST_TO is not configured");

  const items = await listPendingForDigest(env.DB);
  if (items.length === 0) return { sent: false, itemCount: 0 };

  const digest = buildDigest(items, now);
  const result = await env.EMAIL.send({
    from: env.DIGEST_FROM?.trim() || DEFAULT_DIGEST_FROM,
    to,
    subject: digest.subject,
    text: digest.text,
    html: digest.html,
  });
  await markDigested(
    env.DB,
    items.map((i) => i.id),
    Math.floor(now.getTime() / 1000)
  );
  return { sent: true, itemCount: items.length, messageId: result?.messageId };
}
