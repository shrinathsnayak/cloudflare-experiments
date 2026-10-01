import {
  DEFAULT_FORMAT,
  FIT_MODES,
  MAX_DIMENSION,
  MAX_QUALITY,
  MIN_QUALITY,
  OUTPUT_FORMATS,
} from "../constants/defaults";
import type { ConvertOptions, FitMode, OutputFormat, ParseResult } from "../types/image";

type QueryGetter = (key: string) => string | undefined;

function parseInteger(value: string, min: number, max: number): number | null {
  if (!/^\d+$/.test(value.trim())) return null;
  const n = Number(value);
  return n >= min && n <= max ? n : null;
}

function invalid(code: string, message: string): ParseResult<never> {
  return { ok: false, code, message, status: 400 };
}

export function isOutputFormat(value: string): value is OutputFormat {
  return Object.hasOwn(OUTPUT_FORMATS, value);
}

export function parseConvertOptions(query: QueryGetter): ParseResult<ConvertOptions> {
  const rawFormat = (query("format") ?? DEFAULT_FORMAT).trim().toLowerCase();
  const format = rawFormat === "jpg" ? "jpeg" : rawFormat;
  if (!isOutputFormat(format)) {
    return invalid(
      "INVALID_FORMAT",
      `Invalid format "${rawFormat}". Use one of: ${Object.keys(OUTPUT_FORMATS).join(", ")}`
    );
  }
  const options: ConvertOptions = { format };

  const rawQuality = query("quality");
  if (rawQuality !== undefined) {
    const quality = parseInteger(rawQuality, MIN_QUALITY, MAX_QUALITY);
    if (quality === null) {
      return invalid("INVALID_QUALITY", `quality must be an integer ${MIN_QUALITY}-${MAX_QUALITY}`);
    }
    options.quality = quality;
  }

  for (const key of ["width", "height"] as const) {
    const raw = query(key);
    if (raw === undefined) continue;
    const value = parseInteger(raw, 1, MAX_DIMENSION);
    if (value === null) {
      return invalid("INVALID_DIMENSIONS", `${key} must be an integer 1-${MAX_DIMENSION}`);
    }
    options[key] = value;
  }

  const rawFit = query("fit");
  if (rawFit !== undefined) {
    if (!FIT_MODES.includes(rawFit as FitMode)) {
      return invalid("INVALID_FIT", `Invalid fit "${rawFit}". Use one of: ${FIT_MODES.join(", ")}`);
    }
    if (options.width === undefined && options.height === undefined) {
      return invalid("INVALID_DIMENSIONS", "fit requires width and/or height");
    }
    options.fit = rawFit as FitMode;
  }

  return { ok: true, value: options };
}
