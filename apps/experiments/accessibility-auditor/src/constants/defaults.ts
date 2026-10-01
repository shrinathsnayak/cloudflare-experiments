export const ALLOWED_SCHEMES = ["http:", "https:"] as const;
export const DEFAULT_VIEWPORT = { width: 1280, height: 800 };
export const NAVIGATION_TIMEOUT_MS = 20_000;

export const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
export const MAX_NODES_PER_VIOLATION = 10;
export const MAX_HTML_LENGTH = 300;
export const MAX_AXE_ATTEMPTS = 2;

export const IMPACT_WEIGHTS = { critical: 10, serious: 5, moderate: 3, minor: 1 } as const;

export const MAX_ALT_IMAGES = 5;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const IMAGE_FETCH_TIMEOUT_MS = 10_000;

export const VISION_MODEL = "@cf/llava-hf/llava-1.5-7b-hf";
export const ALT_TEXT_PROMPT =
  "Write concise alt text (one sentence, under 125 characters) describing this image for a screen reader user. Do not start with 'Image of' or 'Picture of'.";
export const ALT_TEXT_MAX_TOKENS = 80;
