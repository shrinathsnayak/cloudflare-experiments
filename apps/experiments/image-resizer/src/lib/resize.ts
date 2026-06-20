import { DEFAULT_FIT, MAX_DIMENSION, VALID_FITS, type ImageFit } from "../constants/defaults";

export function parseDimension(input: string | undefined): number | null {
  if (input === undefined) return null;
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isInteger(value) || value <= 0 || value > MAX_DIMENSION) return null;
  return value;
}

export function normalizeFit(input: string | undefined): ImageFit | null {
  const raw = (input ?? DEFAULT_FIT).trim().toLowerCase();
  if (VALID_FITS.includes(raw as ImageFit)) {
    return raw as ImageFit;
  }
  return null;
}

export function buildImageOptions(
  width: number | null,
  height: number | null,
  fit: ImageFit
): NonNullable<RequestInitCfProperties["image"]> {
  const options: NonNullable<RequestInitCfProperties["image"]> = { fit };
  if (width !== null) options.width = width;
  if (height !== null) options.height = height;
  return options;
}
