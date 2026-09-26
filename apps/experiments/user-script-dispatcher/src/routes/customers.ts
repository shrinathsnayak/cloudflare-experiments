import { Hono } from "hono";
import type { Env } from "../types/env";
import type { RegisterCustomerRequest } from "../types/script";
import { listCustomers, registerCustomer, validateName } from "../lib/script";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/customers", async (c) => {
  const customers = await listCustomers(c.env.SCRIPTS);
  return jsonSuccess(c, { customers });
});

app.post("/register", async (c) => {
  let body: RegisterCustomerRequest;
  try {
    body = await c.req.json<RegisterCustomerRequest>();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_BODY");
  }

  const name = validateName(body.name);
  if (!name) {
    return jsonError(c, "Missing or invalid field: name", "INVALID_NAME");
  }

  await registerCustomer(c.env.SCRIPTS, name);
  return jsonSuccess(c, { name, registered: true });
});

export default app;
