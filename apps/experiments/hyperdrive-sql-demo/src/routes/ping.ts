import { Hono } from "hono";
import type { Env } from "../types/env";
import { pingDatabase } from "../lib/db";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/ping", async (c) => {
  const connectionString = c.env.HYPERDRIVE?.connectionString;
  if (!connectionString) {
    return jsonError(c, "HYPERDRIVE binding is missing", "MISSING_BINDING", 502);
  }

  try {
    const result = await pingDatabase(connectionString);
    return jsonSuccess(c, result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Database ping failed";
    return jsonError(c, message, "DB_ERROR", 502);
  }
});

export default app;
