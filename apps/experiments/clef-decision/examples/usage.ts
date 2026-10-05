/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 */
import { runDecision } from "../src/lib/decision";

export default {
  async fetch(request: Request, env: { AI: Ai }): Promise<Response> {
    if (request.method !== "POST") {
      return Response.json(
        { error: "Method not allowed", code: "METHOD_NOT_ALLOWED" },
        { status: 405 }
      );
    }

    const body = (await request.json()) as {
      state?: string;
      questions?: Array<
        { type: "noul"; question: string } | { type: "choice"; question: string; choices: string[] }
      >;
      model?: "@cf/cloudflare/clef" | "@cf/cloudflare/clef-flash";
    };

    if (!body.state || !body.questions?.length) {
      return Response.json(
        { error: "Missing state or questions", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const result = await runDecision(env, body.state, body.questions, body.model);
    return Response.json(result);
  },
};
