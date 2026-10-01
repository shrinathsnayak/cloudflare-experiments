/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Set vars TEAM_DOMAIN (https://<team>.cloudflareaccess.com) and POLICY_AUD (the app's AUD tag).
 * Every route registered after `app.use("*", requireAccess)` only runs for verified Access users.
 */
import { Hono } from "hono";
import { requireAccess } from "../src/lib/access";
import type { AccessAppEnv } from "../src/types/access";

const app = new Hono<AccessAppEnv>();

app.use("*", requireAccess);

app.get("/dashboard", (c) => {
  const { email, sub } = c.var.accessIdentity;
  return c.json({ hello: email ?? sub });
});

export default app;
