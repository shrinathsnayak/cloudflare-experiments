import { describe, expect, it, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({
  DurableObject: class {
    constructor(
      readonly ctx: unknown,
      readonly env: unknown
    ) {}
  },
}));

const { SecretVault } = await import("../src/secret-vault");
const { encryptSecret } = await import("../src/lib/crypto");
const { createFakeState } = await import("./helpers/fake-namespace");

async function setup(ttlMs = 60_000) {
  const fake = createFakeState();
  const vault = new SecretVault(fake.state, {} as never);
  const { key, ciphertext, iv } = await encryptSecret("top secret");
  const expiresAt = Date.now() + ttlMs;
  await vault.store({ ciphertext, iv, expiresAt });
  return { ...fake, vault, key, expiresAt };
}

describe("SecretVault", () => {
  it("stores only ciphertext + iv and schedules an alarm", async () => {
    const { data, getAlarm, expiresAt, key } = await setup();
    const stored = JSON.stringify([...data.values()]);
    expect(stored).not.toContain("top secret");
    expect(stored).not.toContain(key);
    expect(getAlarm()).toBe(expiresAt);
  });

  it("reveals once, then reports NOT_FOUND", async () => {
    const { vault, key, getAlarm } = await setup();
    expect(await vault.reveal(key)).toEqual({ ok: true, secret: "top secret" });
    expect(await vault.reveal(key)).toEqual({ ok: false, code: "NOT_FOUND" });
    expect((await vault.status()).exists).toBe(false);
    expect(getAlarm()).toBeNull();
  });

  it("does not burn the secret on a wrong key", async () => {
    const { vault, key } = await setup();
    const wrong = (await encryptSecret("x")).key;
    expect(await vault.reveal(wrong)).toEqual({ ok: false, code: "INVALID_KEY" });
    expect(await vault.reveal(key)).toEqual({ ok: true, secret: "top secret" });
  });

  it("only one of two concurrent reveals succeeds", async () => {
    const { vault, key } = await setup();
    const results = await Promise.all([vault.reveal(key), vault.reveal(key)]);
    expect(results.filter((r) => r.ok)).toHaveLength(1);
  });

  it("alarm deletes the secret", async () => {
    const { vault, data } = await setup();
    await vault.alarm();
    expect(data.size).toBe(0);
    expect(await vault.status()).toEqual({ exists: false, expiresAt: null });
  });

  it("treats past-expiry records as gone even before the alarm fires", async () => {
    const { vault, key } = await setup(-1);
    expect(await vault.reveal(key)).toEqual({ ok: false, code: "NOT_FOUND" });
  });
});
