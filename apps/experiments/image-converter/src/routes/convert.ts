import { Hono, type Context } from "hono";
import type { Env } from "../types/env";
import type { ImageBytes, ParseResult } from "../types/image";
import { convertImage, toImagesFailure } from "../lib/images";
import { fetchRemoteImage, readImageBody } from "../lib/input";
import { parseConvertOptions } from "../lib/params";
import { validateUrl } from "../lib/url";
import { imageResponse, jsonError, jsonFailure } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

async function handleConvert(
  c: Context<{ Bindings: Env }>,
  loadSource: () => Promise<ParseResult<ImageBytes>>
) {
  const options = parseConvertOptions((key) => c.req.query(key));
  if (!options.ok) return jsonFailure(c, options);

  const source = await loadSource();
  if (!source.ok) return jsonFailure(c, source);

  try {
    const image = await convertImage(c.env.IMAGES, source.value.bytes, options.value);
    return imageResponse(image, source.value.contentType);
  } catch (e) {
    return jsonFailure(c, toImagesFailure(e));
  }
}

app.post("/convert", (c) => handleConvert(c, () => readImageBody(c.req.raw)));

app.get("/convert", (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  return handleConvert(c, () => fetchRemoteImage(url));
});

export default app;
