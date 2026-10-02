import { Hono } from "hono";
import type { Env } from "./types/env";
import convertRoutes from "./routes/convert";
import watermarkRoutes from "./routes/watermark";
import infoRoutes from "./routes/info";

const app = new Hono<{ Bindings: Env }>();

app.route("/", convertRoutes);
app.route("/", watermarkRoutes);
app.route("/", infoRoutes);

app.get("/", (c) => {
  return c.json({
    name: "image-converter",
    description:
      "Convert, resize, and watermark images to WebP/AVIF/JPEG/PNG with the Cloudflare Images binding",
    usage: {
      convertUpload: "POST /convert?format=webp&quality=80&width=1200 (image body)",
      convertRemote: "GET /convert?url=https://example.com/photo.jpg&format=avif",
      watermark: "POST /watermark?watermarkUrl=https://example.com/logo.png (image body)",
      info: "POST /info (image body)",
    },
    cloudflareFeatures: ["Images binding (env.IMAGES)"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
