import { Hono } from "hono";
import type { Env } from "./types/env";
import listRoutes from "./routes/list";
import objectRoutes from "./routes/object";

const app = new Hono<{ Bindings: Env }>();

app.route("/", listRoutes);
app.route("/", objectRoutes);

app.get("/", (c) => {
  return c.json({
    name: "r2-storage",
    description: "R2 storage API with list/get/put/delete; public and private buckets for images",
    usage: {
      list: "GET /list?public=&prefix=&limit=&cursor=&delimiter=",
      get: "GET /object?key=<key>&public=",
      head: "HEAD /object?key=<key>&public=",
      put: "PUT /object?key=<key>&public= (body + Content-Type for images)",
      delete: "DELETE /object?key=<key>&public=",
    },
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
