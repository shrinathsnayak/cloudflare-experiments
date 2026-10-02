export const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
export const TURNSTILE_FIELD = "cf-turnstile-response";
export const HONEYPOT_FIELD = "_gotcha";

export const MAX_FIELDS = 30;
export const MAX_FIELD_LENGTH = 5_000;
export const MAX_FIELD_NAME_LENGTH = 100;
export const SUBMISSIONS_PAGE_SIZE = 50;

export const DEFAULT_FROM_EMAIL = "forms@example.com";
export const ALLOWED_SCHEMES = ["http:", "https:"] as const;
