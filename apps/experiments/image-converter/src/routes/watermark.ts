import { Hono } from "hono";
import type { Env } from "../types/env";
import { convertImage, toImagesFailure } from "../lib/images";
import { fetchRemoteImage, readImageBody } from "../lib/input";
import { parseConvertOptions } from "../lib/params";
import { validateUrl } from "../lib/url";
import { imageResponse, jsonError, jsonFailure } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/watermark", async (c) => {
  const watermarkUrl = validateUrl(c.req.query("watermarkUrl"));
  if (!watermarkUrl) {
    return jsonError(c, "Missing or invalid query parameter: watermarkUrl", "INVALID_URL");
  }
  const options = parseConvertOptions((key) => c.req.query(key));
  if (!options.ok) return jsonFailure(c, options);

  const source = await readImageBody(c.req.raw);
  if (!source.ok) return jsonFailure(c, source);
  const overlay = await fetchRemoteImage(watermarkUrl);
  if (!overlay.ok) return jsonFailure(c, overlay);

  try {
    const image = await convertImage(
      c.env.IMAGES,
      source.value.bytes,
      options.value,
      overlay.value.bytes
    );
    return imageResponse(image, source.value.contentType);
  } catch (e) {
    return jsonFailure(c, toImagesFailure(e));
  }
});

export default app;
