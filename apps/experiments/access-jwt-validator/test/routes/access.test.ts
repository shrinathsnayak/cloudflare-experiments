import { describe, expect, it, vi } from "vitest";
import worker from "../../src/index";
import { env, mintAccessJwt } from "../helpers/keys";

vi.mock("../../src/lib/jwks", async () => {
  const keys = await import("../helpers/keys");
  return { getRemoteKeySet: () => keys.localKeySet };
});

type ErrorBody = { error: string; code: string };

function get(path: string, headers: Record<string, string> = {}, bindings: object = env) {
  return worker.fetch(new Request(`https://app.example.com${path}`, { headers }), bindings);
}

describe("GET /me", () => {
  it("returns 500 NOT_CONFIGURED without vars", async () => {
    const res = await get("/me", {}, {});
    expect(res.status).toBe(500);
    expect(((await res.json()) as ErrorBody).code).toBe("NOT_CONFIGURED");
  });

  it("returns 401 MISSING_TOKEN without a token", async () => {
    const res = await get("/me");
    expect(res.status).toBe(401);
    expect(((await res.json()) as ErrorBody).code).toBe("MISSING_TOKEN");
  });

  it("returns identity for a valid header token", async () => {
    const res = await get("/me", { "Cf-Access-Jwt-Assertion": await mintAccessJwt() });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { email: string; source: string };
    expect(body.email).toBe("user@example.com");
    expect(body.source).toBe("header");
  });

  it("accepts the CF_Authorization cookie", async () => {
    const res = await get("/me", { Cookie: `CF_Authorization=${await mintAccessJwt()}` });
    expect(res.status).toBe(200);
    expect(((await res.json()) as { source: string }).source).toBe("cookie");
  });

  it("returns 401 TOKEN_EXPIRED for an expired token", async () => {
    const token = await mintAccessJwt({ expiresIn: Math.floor(Date.now() / 1000) - 10 });
    const res = await get("/me", { "Cf-Access-Jwt-Assertion": token });
    expect(res.status).toBe(401);
    expect(((await res.json()) as ErrorBody).code).toBe("TOKEN_EXPIRED");
  });

  it("returns 401 INVALID_TOKEN for the wrong audience", async () => {
    const token = await mintAccessJwt({ audience: "another-app" });
    const res = await get("/me", { "Cf-Access-Jwt-Assertion": token });
    expect(res.status).toBe(401);
    expect(((await res.json()) as ErrorBody).code).toBe("INVALID_TOKEN");
  });

  it("ignores an unverified Cf-Access-Authenticated-User-Email header", async () => {
    const res = await get("/me", { "Cf-Access-Authenticated-User-Email": "admin@example.com" });
    expect(res.status).toBe(401);
  });
});

describe("GET /protected", () => {
  it("rejects requests without a token", async () => {
    const res = await get("/protected");
    expect(res.status).toBe(401);
  });

  it("greets the verified user", async () => {
    const res = await get("/protected", { "Cf-Access-Jwt-Assertion": await mintAccessJwt() });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { user: string };
    expect(body.user).toBe("user@example.com");
  });

  it("falls back to common_name for service tokens", async () => {
    const token = await mintAccessJwt({ claims: { email: undefined, common_name: "svc.access" } });
    const res = await get("/protected", { "Cf-Access-Jwt-Assertion": token });
    expect(((await res.json()) as { user: string }).user).toBe("svc.access");
  });
});
