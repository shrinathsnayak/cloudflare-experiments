import PostalMime from "postal-mime";
import type { Env } from "../types/env";
import type { InboxMessage } from "../types/inbox";
import { createMessageId, storeInboxMessage } from "./inbox";
import { shouldReject } from "./policy";

/**
 * Process an inbound Email Worker message: parse, optionally reject, store in KV.
 */
export async function handleInboundEmail(
  message: ForwardableEmailMessage,
  env: Env
): Promise<void> {
  const parsed = await PostalMime.parse(message.raw);
  const subject = parsed.subject ?? message.headers.get("subject") ?? "(no subject)";
  const rejectReason = shouldReject(message.from, subject);

  if (rejectReason) {
    message.setReject(rejectReason);
  }

  const stored: InboxMessage = {
    id: createMessageId(),
    from: message.from,
    to: message.to,
    subject,
    receivedAt: new Date().toISOString(),
    text: parsed.text?.slice(0, 4000),
    html: parsed.html?.slice(0, 4000),
    messageId: parsed.messageId,
    ...(rejectReason ? { rejected: true, rejectReason } : { rejected: false }),
  };

  await storeInboxMessage(env.INBOX, stored);
}
