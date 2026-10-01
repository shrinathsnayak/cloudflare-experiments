/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Parses any form body, drops honeypot hits, and verifies Turnstile before handling the fields.
 */
import { parseSubmission } from "../src/lib/body";
import { verifyTurnstile } from "../src/lib/turnstile";

interface Env {
  TURNSTILE_SECRET_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

    const parsed = await parseSubmission(request);
    if (!parsed.ok) {
      return Response.json({ error: parsed.message, code: parsed.code }, { status: parsed.status });
    }
    if (parsed.honeypotFilled) return Response.json({ ok: true });

    const ip = request.headers.get("CF-Connecting-IP") ?? undefined;
    const { success } = await verifyTurnstile(
      env.TURNSTILE_SECRET_KEY,
      parsed.turnstileToken ?? "",
      ip
    );
    if (!success) {
      return Response.json(
        { error: "Turnstile verification failed", code: "TURNSTILE_FAILED" },
        { status: 403 }
      );
    }

    // Store or forward parsed.fields here.
    return Response.json({ ok: true, fields: parsed.fields });
  },
};
