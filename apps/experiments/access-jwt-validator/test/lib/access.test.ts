import { describe, expect, it } from "vitest";
import {
  AccessError,
  getAccessConfig,
  getAccessToken,
  normalizeTeamDomain,
  verifyAccessJwt,
} from "../../src/lib/access";
import { localKeySet, mintAccessJwt, POLICY_AUD, TEAM_DOMAIN } from "../helpers/keys";

const config = { teamDomain: TEAM_DOMAIN, audience: POLICY_AUD };

async function expectAccessError(promise: Promise<unknown>, code: string) {
  const err = await promise.catch((e: unknown) => e);
  expect(err).toBeInstanceOf(AccessError);
  expect((err as AccessError).code).toBe(code);
}

describe("normalizeTeamDomain", () => {
  it("normalizes to an https origin", () => {
    expect(normalizeTeamDomain("testteam.cloudflareaccess.com")).toBe(TEAM_DOMAIN);
    expect(normalizeTeamDomain(`${TEAM_DOMAIN}/`)).toBe(TEAM_DOMAIN);
  });

  it("rejects empty and non-https values", () => {
    expect(normalizeTeamDomain("")).toBeNull();
    expect(normalizeTeamDomain("http://testteam.cloudflareaccess.com")).toBeNull();
  });
});

describe("getAccessConfig", () => {
  it("requires both vars", () => {
    expect(getAccessConfig({ TEAM_DOMAIN })).toBeNull();
    expect(getAccessConfig({ TEAM_DOMAIN, POLICY_AUD })).toEqual(config);
  });
});

describe("getAccessToken", () => {
  it("prefers the Cf-Access-Jwt-Assertion header", () => {
    const req = new Request("https://app.example.com", {
      headers: {
        "Cf-Access-Jwt-Assertion": "header-token",
        Cookie: "CF_Authorization=cookie-token",
      },
    });
    expect(getAccessToken(req)).toEqual({ token: "header-token", source: "header" });
  });

  it("falls back to the CF_Authorization cookie", () => {
    const req = new Request("https://app.example.com", {
      headers: { Cookie: "theme=dark; CF_Authorization=cookie-token" },
    });
    expect(getAccessToken(req)).toEqual({ token: "cookie-token", source: "cookie" });
  });

  it("returns null when absent", () => {
    expect(getAccessToken(new Request("https://app.example.com"))).toBeNull();
  });
});

describe("verifyAccessJwt", () => {
  it("returns identity claims for a valid token", async () => {
    const identity = await verifyAccessJwt(await mintAccessJwt(), config, "header", localKeySet);
    expect(identity).toMatchObject({
      email: "user@example.com",
      sub: "user-sub-1",
      country: "US",
      identity_nonce: "nonce-123",
      iss: TEAM_DOMAIN,
      aud: [POLICY_AUD],
      source: "header",
    });
  });

  it("rejects an expired token", async () => {
    const token = await mintAccessJwt({ expiresIn: Math.floor(Date.now() / 1000) - 10 });
    await expectAccessError(verifyAccessJwt(token, config, "header", localKeySet), "TOKEN_EXPIRED");
  });

  it("rejects the wrong audience", async () => {
    const token = await mintAccessJwt({ audience: "another-app" });
    await expectAccessError(verifyAccessJwt(token, config, "header", localKeySet), "INVALID_TOKEN");
  });

  it("rejects the wrong issuer", async () => {
    const token = await mintAccessJwt({ issuer: "https://evil.cloudflareaccess.com" });
    await expectAccessError(verifyAccessJwt(token, config, "header", localKeySet), "INVALID_TOKEN");
  });

  it("rejects a token signed by an unknown key", async () => {
    const token = await mintAccessJwt({ signWithOtherKey: true });
    await expectAccessError(verifyAccessJwt(token, config, "header", localKeySet), "INVALID_TOKEN");
  });

  it("rejects garbage", async () => {
    await expectAccessError(
      verifyAccessJwt("not.a.jwt", config, "header", localKeySet),
      "INVALID_TOKEN"
    );
  });

  it("maps key fetch failures to JWKS_UNAVAILABLE", async () => {
    const failingKeySet = async () => {
      throw new TypeError("network down");
    };
    await expectAccessError(
      verifyAccessJwt(await mintAccessJwt(), config, "header", failingKeySet),
      "JWKS_UNAVAILABLE"
    );
  });
});
