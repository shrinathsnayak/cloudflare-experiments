/** Allowed URL schemes for security. */
export const ALLOWED_SCHEMES = ["http:", "https:"] as const;

/** Max redirect hops to follow (avoids infinite loops). */
export const MAX_REDIRECTS = 20;

/** HTTP status codes that indicate a redirect. */
export const REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308] as const;
