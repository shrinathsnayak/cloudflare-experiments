import { Hono } from "hono";
import type { Env } from "../types/env";
import { callCounter } from "../lib/counter";
import { jsonSuccess } from "../utils/response";

const counterRoutes = new Hono<{ Bindings: Env }>();

counterRoutes.get("/counter", async (c) => {
  const result = await callCounter(c.env, "get");
  return jsonSuccess(c, result);
});

counterRoutes.post("/counter/increment", async (c) => {
  const result = await callCounter(c.env, "increment");
  return jsonSuccess(c, result);
});

counterRoutes.post("/counter/reset", async (c) => {
  const result = await callCounter(c.env, "reset");
  return jsonSuccess(c, result);
});

export default counterRoutes;
