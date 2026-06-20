import { Hono } from "hono";
import type { Env } from "../types/env";
import { getHeartbeatStatus } from "../lib/status";
import { jsonSuccess } from "../utils/response";

const statusRoutes = new Hono<{ Bindings: Env }>();

statusRoutes.get("/status", async (c) => {
  const status = await getHeartbeatStatus(c.env);
  return jsonSuccess(c, status);
});

export default statusRoutes;
