import {
  IMAGES_ERROR_NOT_AN_IMAGE,
  OUTPUT_FORMATS,
  WATERMARK_MARGIN_PX,
  WATERMARK_OPACITY,
} from "../constants/defaults";
import type { ConvertedImage, ConvertOptions, Failure, ImageInfo } from "../types/image";
import { toStream } from "./input";

export async function convertImage(
  images: ImagesBinding,
  input: Uint8Array,
  options: ConvertOptions,
  overlay?: Uint8Array
): Promise<ConvertedImage> {
  let transformer = images.input(toStream(input));
  if (options.width !== undefined || options.height !== undefined) {
    transformer = transformer.transform({
      width: options.width,
      height: options.height,
      fit: options.fit,
    });
  }
  if (overlay) {
    transformer = transformer.draw(toStream(overlay), {
      opacity: WATERMARK_OPACITY,
      bottom: WATERMARK_MARGIN_PX,
      right: WATERMARK_MARGIN_PX,
    });
  }

  const result = await transformer.output({
    format: OUTPUT_FORMATS[options.format],
    // PNG is lossless; quality only applies to JPEG, WebP and AVIF.
    quality: options.format === "png" ? undefined : options.quality,
  });
  const body = await result.response().arrayBuffer();
  return {
    body,
    contentType: result.contentType(),
    originalSize: input.byteLength,
    outputSize: body.byteLength,
  };
}

export async function getImageInfo(images: ImagesBinding, input: Uint8Array): Promise<ImageInfo> {
  const info = await images.info(toStream(input));
  return {
    format: info.format,
    fileSize: "fileSize" in info ? info.fileSize : input.byteLength,
    width: "width" in info ? info.width : null,
    height: "height" in info ? info.height : null,
  };
}

/** Maps an Images binding error: code 9412 (not an image) → 415, everything else → 502. */
export function toImagesFailure(e: unknown): Failure {
  const code = typeof e === "object" && e !== null && "code" in e ? e.code : undefined;
  if (code === IMAGES_ERROR_NOT_AN_IMAGE) {
    return {
      ok: false,
      code: "UNSUPPORTED_MEDIA_TYPE",
      message: "Input is not a supported image",
      status: 415,
    };
  }
  console.error("Images binding error", e);
  return { ok: false, code: "IMAGES_ERROR", message: "Image processing failed", status: 502 };
}
