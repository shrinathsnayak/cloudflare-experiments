import { Hono } from "hono";
import type { AccessAppEnv } from "../types/access";
import { requireAccess } from "../lib/access";
import { jsonSuccess } from "../utils/response";

const app = new Hono<AccessAppEnv>();

app.get("/me", requireAccess, (c) => jsonSuccess(c, c.var.accessIdentity));

export default app;
