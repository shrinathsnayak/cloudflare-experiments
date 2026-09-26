import { Hono } from "hono";
import { APP_DESCRIPTION, APP_NAME } from "../constants/defaults";
import type { HelloResponse, InfoResponse } from "../types/api";
import type { Env } from "../types/env";
import { jsonSuccess } from "../utils/response";

const apiRoutes = new Hono<{ Bindings: Env }>();

apiRoutes.get("/hello", (c) => {
  const data: HelloResponse = {
    message: "Hello from the Worker",
    servedBy: "worker",
  };
  return jsonSuccess(c, data);
});

apiRoutes.get("/info", (c) => {
  const data: InfoResponse = {
    name: APP_NAME,
    description: APP_DESCRIPTION,
    assetsBinding: Boolean(c.env?.ASSETS),
  };
  return jsonSuccess(c, data);
});

export default apiRoutes;
