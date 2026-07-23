/** Max stored inbox messages (newest kept). */
export const MAX_INBOX_MESSAGES = 50;

/** KV key for the inbox index. */
export const INBOX_INDEX_KEY = "inbox:index";

/** Prefix for message bodies. */
export const MESSAGE_KEY_PREFIX = "inbox:msg:";

/** TTL for stored messages (7 days). */
export const MESSAGE_TTL_SECONDS = 60 * 60 * 24 * 7;
