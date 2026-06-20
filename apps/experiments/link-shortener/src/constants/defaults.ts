/** Allowed URL schemes for shortening. */
export const ALLOWED_SCHEMES = ["http:", "https:"] as const;

/** Length of generated short codes. */
export const CODE_LENGTH = 6;

/** Characters for short codes (alphanumeric, URL-safe). */
export const CODE_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
