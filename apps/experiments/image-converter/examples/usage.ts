/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: POST /convert?format=webp&quality=80&width=1200 (image body)
 * Requires wrangler.json: "images": { "binding": "IMAGES" }
 */
import { convertImage } from "../src/lib/images";
import { readImageBody } from "../src/lib/input";
import { parseConvertOptions } from "../src/lib/params";

export default {
  async fetch(request: Request, env: { IMAGES: ImagesBinding }): Promise<Response> {
    const query = new URL(request.url).searchParams;
    const options = parseConvertOptions((key) => query.get(key) ?? undefined);
    if (!options.ok) return Response.json(options, { status: options.status });

    const source = await readImageBody(request);
    if (!source.ok) return Response.json(source, { status: source.status });

    const image = await convertImage(env.IMAGES, source.value.bytes, options.value);
    return new Response(image.body, {
      headers: {
        "Content-Type": image.contentType,
        "X-Original-Size": String(image.originalSize),
        "X-Output-Size": String(image.outputSize),
      },
    });
  },
};
