import { Hono } from "hono";
import type { Env } from "../types/env";
import type { AltTextResponse } from "../types/audit";
import { generateAltText } from "../lib/alt-text";
import { fetchImage, readImageBody, type ImageReadResult } from "../lib/image";
import { validateUrl } from "../lib/url";
import { VISION_MODEL } from "../constants/defaults";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/alt-text", async (c) => {
  const imageParam = c.req.query("image");
  let image: ImageReadResult;
  if (imageParam !== undefined) {
    const imageUrl = validateUrl(imageParam);
    if (!imageUrl) {
      return jsonError(c, "Invalid query parameter: image (http or https URL)", "INVALID_URL");
    }
    image = await fetchImage(imageUrl);
  } else {
    image = await readImageBody(c.req.raw);
  }
  if (!image.ok) return jsonError(c, image.message, image.code, image.status);

  try {
    const altText = await generateAltText(c.env.AI, image.bytes);
    return jsonSuccess<AltTextResponse>(c, { altText, model: VISION_MODEL });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Alt text generation failed";
    return jsonError(c, message, "AI_ERROR", 502);
  }
});

export default app;
