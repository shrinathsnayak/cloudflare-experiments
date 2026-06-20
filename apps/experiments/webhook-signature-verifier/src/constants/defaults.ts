export const DEFAULT_ALGORITHM = "sha256" as const;

export const SUPPORTED_ALGORITHMS = ["sha256", "hmac-sha256"] as const;

export const MAX_PAYLOAD_LENGTH = 1_000_000;

export const MAX_SECRET_LENGTH = 10_000;

export const MAX_SIGNATURE_LENGTH = 512;
