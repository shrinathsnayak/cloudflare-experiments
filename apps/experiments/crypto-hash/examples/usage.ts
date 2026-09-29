/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 */
import { hashText } from "../src/lib/hash";

export default {
  async fetch(request: Request): Promise<Response> {
    const text = new URL(request.url).searchParams.get("text");
    if (!text) {
      return Response.json({ error: "Missing text", code: "INVALID_TEXT" }, { status: 400 });
    }
    const hash = await hashText(text, "SHA-256");
    return Response.json({ algorithm: "SHA-256", hash, inputLength: text.length });
  },
};
