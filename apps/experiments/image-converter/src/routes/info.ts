import { Hono } from "hono";
import type { Env } from "../types/env";
import { getImageInfo, toImagesFailure } from "../lib/images";
import { readImageBody } from "../lib/input";
import { jsonFailure, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/info", async (c) => {
  const source = await readImageBody(c.req.raw);
  if (!source.ok) return jsonFailure(c, source);

  try {
    return jsonSuccess(c, await getImageInfo(c.env.IMAGES, source.value.bytes));
  } catch (e) {
    return jsonFailure(c, toImagesFailure(e));
  }
});

export default app;
