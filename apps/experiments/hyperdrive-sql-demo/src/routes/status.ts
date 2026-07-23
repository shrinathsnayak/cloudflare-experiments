import { Hono } from "hono";
import type { Env } from "../types/env";
import { redactConnectionString } from "../lib/sql";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/status", (c) => {
  const hyperdrive = c.env.HYPERDRIVE;
  if (!hyperdrive?.connectionString) {
    return jsonError(
      c,
      "HYPERDRIVE binding is missing. Create a Hyperdrive config and set its id in wrangler.json.",
      "MISSING_BINDING",
      502
    );
  }

  const meta = redactConnectionString(hyperdrive.connectionString);
  return jsonSuccess(c, {
    bound: true,
    host: meta.host,
    database: meta.database,
    user: meta.user,
  });
});

export default app;
