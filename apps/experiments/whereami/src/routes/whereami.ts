import { Hono } from "hono";
import type { Env } from "../types/env";
import { getCf } from "../lib/cf";
import { jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/whereami", (c) => {
  const cf = getCf(c);
  return jsonSuccess(c, cf);
});

export default app;
