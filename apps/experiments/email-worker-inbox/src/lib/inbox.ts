import {
  INBOX_INDEX_KEY,
  MAX_INBOX_MESSAGES,
  MESSAGE_KEY_PREFIX,
  MESSAGE_TTL_SECONDS,
} from "../constants/defaults";
import type { InboxMessage } from "../types/inbox";

function messageKey(id: string): string {
  return `${MESSAGE_KEY_PREFIX}${id}`;
}

export async function listInbox(kv: KVNamespace): Promise<InboxMessage[]> {
  const index = (await kv.get(INBOX_INDEX_KEY, "json")) as string[] | null;
  if (!index?.length) return [];

  const messages: InboxMessage[] = [];
  for (const id of index) {
    const msg = (await kv.get(messageKey(id), "json")) as InboxMessage | null;
    if (msg) messages.push(msg);
  }
  return messages;
}

export async function getInboxMessage(kv: KVNamespace, id: string): Promise<InboxMessage | null> {
  return (await kv.get(messageKey(id), "json")) as InboxMessage | null;
}

export async function storeInboxMessage(kv: KVNamespace, message: InboxMessage): Promise<void> {
  const index = ((await kv.get(INBOX_INDEX_KEY, "json")) as string[] | null) ?? [];
  const next = [message.id, ...index.filter((id) => id !== message.id)].slice(
    0,
    MAX_INBOX_MESSAGES
  );

  await kv.put(messageKey(message.id), JSON.stringify(message), {
    expirationTtl: MESSAGE_TTL_SECONDS,
  });
  await kv.put(INBOX_INDEX_KEY, JSON.stringify(next), {
    expirationTtl: MESSAGE_TTL_SECONDS,
  });
}

export function createMessageId(): string {
  return crypto.randomUUID();
}
