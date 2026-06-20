import { describe, it, expect } from "vitest";
import { decodeJwt, issueHs256Token, verifyJwt } from "../../src/lib/jwt";

describe("jwt", () => {
  it("issues and verifies HS256 tokens", async () => {
    const secret = "test-secret-key";
    const token = await issueHs256Token(
      { sub: "user-1", exp: Math.floor(Date.now() / 1000) + 60 },
      secret
    );
    const decoded = decodeJwt(token);
    expect(decoded.payload.sub).toBe("user-1");
    const verified = await verifyJwt(token, { secret });
    expect(verified.valid).toBe(true);
  });

  it("rejects invalid tokens on verify", async () => {
    const token = await issueHs256Token({ sub: "user-1" }, "secret-one");
    const verified = await verifyJwt(token, { secret: "secret-two" });
    expect(verified.valid).toBe(false);
  });
});
