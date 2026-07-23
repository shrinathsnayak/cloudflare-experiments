import { Hono } from "hono";
import type { Env } from "./types/env";
import parseRoutes from "./routes/parse";

const app = new Hono<{ Bindings: Env }>();

app.route("/", parseRoutes);

app.get("/", (c) => {
  return c.json({
    name: "rss-atom-feed-parser",
    description: "Parse RSS or Atom feeds into normalized JSON from the edge",
    usage: "GET /parse?url=https://example.com/feed.xml",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
