import { Hono } from "hono";
import type { AccessAppEnv } from "../types/access";
import { requireAccess } from "../lib/access";
import { jsonSuccess } from "../utils/response";

const app = new Hono<AccessAppEnv>();

app.use("/protected/*", requireAccess);

app.get("/protected", (c) => {
  const identity = c.var.accessIdentity;
  const who = identity.email ?? identity.common_name ?? identity.sub;
  return jsonSuccess(c, {
    message: `Hello, ${who}. This response was only sent after verifying your Access JWT.`,
    user: who,
    country: identity.country ?? null,
  });
});

export default app;
