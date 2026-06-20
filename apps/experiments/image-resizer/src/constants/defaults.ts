/** Max time (ms) to wait for the target URL to respond. */
export const FETCH_TIMEOUT_MS = 15_000;

/** Allowed URL schemes for security. */
export const ALLOWED_SCHEMES = ["http:", "https:"] as const;

export const DEFAULT_FIT = "scale-down" as const;

export const VALID_FITS = ["scale-down", "contain", "cover", "crop", "pad"] as const;

export type ImageFit = (typeof VALID_FITS)[number];

export const MAX_DIMENSION = 4096;
