import { Hono } from "hono";
import type { Env } from "../types/env";
import { jsonSuccess, jsonError } from "../utils/response";
import { generateKeyPairAndTest } from "../lib/mlkem";

const app = new Hono<{ Bindings: Env }>();

app.get("/keygen", async (c) => {
  try {
    const result = await generateKeyPairAndTest();
    return jsonSuccess(c, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(c, message, "MLKEM_ERROR", 500);
  }
});

export default app;
