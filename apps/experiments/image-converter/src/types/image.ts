import type { FIT_MODES, OUTPUT_FORMATS } from "../constants/defaults";

export type OutputFormat = keyof typeof OUTPUT_FORMATS;
export type FitMode = (typeof FIT_MODES)[number];

export type ConvertOptions = {
  format: OutputFormat;
  quality?: number;
  width?: number;
  height?: number;
  fit?: FitMode;
};

export type ErrorStatus = 400 | 413 | 415 | 502;

export type Failure = { ok: false; code: string; message: string; status: ErrorStatus };

export type ParseResult<T> = { ok: true; value: T } | Failure;

export type ImageBytes = { bytes: Uint8Array; contentType: string };

export type ConvertedImage = {
  body: ArrayBuffer;
  contentType: string;
  originalSize: number;
  outputSize: number;
};

export type ImageInfo = {
  format: string;
  fileSize: number;
  width: number | null;
  height: number | null;
};
