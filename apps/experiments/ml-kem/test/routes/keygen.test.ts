import { describe, it, expect, vi } from "vitest";
import worker from "../../src/index";

vi.mock("../../src/lib/mlkem", () => ({
  generateKeyPairAndTest: vi.fn().mockResolvedValue({
    algorithm: "ML-KEM-768",
    publicKey: "a1b2c3...",
    ciphertext: "d4e5f6...",
    encapsulatedSecret: "g7h8i9...",
    decapsulatedSecret: "g7h8i9...",
    secretsMatch: true,
    publicKeyLength: 1184,
    ciphertextLength: 1088,
    sharedSecretLength: 32,
  }),
}));

describe("GET /keygen", () => {
  it("returns 200 with ML-KEM key generation result", async () => {
    const res = await worker.fetch(new Request("http://localhost/keygen"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      algorithm: string;
      secretsMatch: boolean;
      publicKeyLength: number;
      ciphertextLength: number;
      sharedSecretLength: number;
    };
    expect(body.algorithm).toBe("ML-KEM-768");
    expect(body.secretsMatch).toBe(true);
    expect(body.publicKeyLength).toBeGreaterThan(0);
    expect(body.ciphertextLength).toBeGreaterThan(0);
    expect(body.sharedSecretLength).toBe(32);
  });
});
