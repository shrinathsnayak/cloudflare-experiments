export const ALLOWED_SCHEMES = ["http:", "https:"] as const;

export const POP_LIMITATION =
  "Each Worker invocation runs in a single Cloudflare PoP. This endpoint reports latency from the PoP that handled your request, not a global multi-region sweep.";

export const POP_TIP =
  "For multi-region comparison, call this endpoint repeatedly from different client locations or use Cloudflare's own observability tools.";
