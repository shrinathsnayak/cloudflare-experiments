/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: POST /decode with { token }
 */
import { decodeJwt, validateToken } from "../src/lib/jwt";

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return Response.json({ error: "POST required", code: "METHOD_NOT_ALLOWED" }, { status: 405 });
    }
    const body = (await request.json()) as { token?: unknown };
    const token = validateToken(body.token);
    if (!token) {
      return Response.json({ error: "Missing or invalid token", code: "INVALID_TOKEN" }, { status: 400 });
    }
    try {
      return Response.json(decodeJwt(token));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Decode failed";
      return Response.json({ error: message, code: "DECODE_ERROR" }, { status: 400 });
    }
  },
};
