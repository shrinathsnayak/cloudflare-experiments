import PostalMime from "postal-mime";
import { MAX_EMAIL_BYTES } from "../constants/defaults";
import type { Env } from "../types/env";
import type { InboundResult } from "../types/digest";
import { isAllowedSender, parseAllowedSenders } from "./senders";
import { insertItem } from "./store";
import { summarizeNewsletter } from "./summarize";
import { extractFirstLink, htmlToText } from "./text";

export async function handleNewsletter(
  message: ForwardableEmailMessage,
  env: Env
): Promise<InboundResult> {
  if (message.rawSize > MAX_EMAIL_BYTES) {
    const reason = "Message exceeds 1 MB limit";
    message.setReject(reason);
    return { status: "rejected", reason };
  }

  const raw = await new Response(message.raw).arrayBuffer();
  const parsed = await PostalMime.parse(raw);
  const headerFrom = parsed.from && "address" in parsed.from ? parsed.from : undefined;

  // Forwarded mail usually has the forwarder as envelope sender, so also check the From header.
  if (
    !isAllowedSender([message.from, headerFrom?.address], parseAllowedSenders(env.ALLOWED_SENDERS))
  ) {
    return { status: "ignored", reason: `Sender ${message.from} is not in ALLOWED_SENDERS` };
  }

  const subject = parsed.subject?.trim() || "(no subject)";
  const text = parsed.text?.trim() || htmlToText(parsed.html ?? "");
  const { summary } = await summarizeNewsletter(env.AI, subject, text);

  const id = await insertItem(env.DB, {
    fromAddress: (headerFrom?.address || message.from).toLowerCase(),
    fromName: headerFrom?.name?.trim() || null,
    subject,
    summary,
    link: extractFirstLink(parsed.html, text),
  });
  return { status: "stored", id };
}
