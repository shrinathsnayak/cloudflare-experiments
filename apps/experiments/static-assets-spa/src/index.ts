import { Hono } from "hono";
import { APP_DESCRIPTION, APP_NAME } from "./constants/defaults";
import apiRoutes from "./routes/api";
import type { Env } from "./types/env";
import { jsonError } from "./utils/response";

const app = new Hono<{ Bindings: Env }>();

app.route("/api", apiRoutes);

app.get("/", (c) => {
  return c.json({
    name: APP_NAME,
    description: APP_DESCRIPTION,
    usage: {
      hello: "GET /api/hello",
      info: "GET /api/info",
      spa: "/",
    },
  });
});

app.all("*", async (c) => {
  if (c.env?.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return jsonError(c, "Not found", "NOT_FOUND", 404);
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
