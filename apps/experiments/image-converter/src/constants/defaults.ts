export const ALLOWED_SCHEMES = ["http:", "https:"] as const;

export const OUTPUT_FORMATS = {
  webp: "image/webp",
  avif: "image/avif",
  jpeg: "image/jpeg",
  png: "image/png",
} as const;
export const DEFAULT_FORMAT = "webp";

export const FIT_MODES = ["scale-down", "contain", "cover", "crop", "pad", "squeeze"] as const;

export const MIN_QUALITY = 1;
export const MAX_QUALITY = 100;
export const MAX_DIMENSION = 4096;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const FETCH_TIMEOUT_MS = 15_000;

export const WATERMARK_OPACITY = 0.6;
export const WATERMARK_MARGIN_PX = 16;

/** ImagesError code for "input is not a supported image". */
export const IMAGES_ERROR_NOT_AN_IMAGE = 9412;
