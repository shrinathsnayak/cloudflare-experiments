import { Hono } from "hono";
import type { Env } from "./types/env";
import probeRoutes from "./routes/probe";
import { SMART_PLACEMENT_HINT } from "./constants/defaults";

const app = new Hono<{ Bindings: Env }>();

app.route("/", probeRoutes);

app.get("/", (c) => {
  return c.json({
    name: "smart-placement-probe",
    description:
      "Demonstrate Workers Smart Placement by probing origin latency from the Worker colo",
    usage: "GET /probe?url=https://example.com",
    smartPlacement: SMART_PLACEMENT_HINT,
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
