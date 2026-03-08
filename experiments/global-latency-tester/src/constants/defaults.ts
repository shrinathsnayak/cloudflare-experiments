export const FETCH_TIMEOUT_MS = 15_000;
export const ALLOWED_SCHEMES = ["http:", "https:"] as const;

/** Number of parallel self-checks for /latency/global (each may run in a different colo). */
export const GLOBAL_CHECK_CONCURRENCY = 20;
/** Timeout per subrequest when running global check. */
export const GLOBAL_CHECK_SUBREQUEST_TIMEOUT_MS = 12_000;
