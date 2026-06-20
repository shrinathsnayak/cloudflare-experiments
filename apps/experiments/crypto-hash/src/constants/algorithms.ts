export const SUPPORTED_ALGORITHMS = ["SHA-256", "SHA-384", "SHA-512"] as const;

export type HashAlgorithm = (typeof SUPPORTED_ALGORITHMS)[number];

export const MAX_TEXT_LENGTH = 10_000;

export const DEFAULT_ALGORITHM: HashAlgorithm = "SHA-256";
