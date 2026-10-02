import { DurableObject } from "cloudflare:workers";
import { STORAGE_KEY } from "./constants/defaults";
import { decryptSecret } from "./lib/crypto";
import type { Env } from "./types/env";
import type { RevealResult, SecretStatus, StoredSecret } from "./types/secret";

/** One instance per secret id. Stores only ciphertext + IV; the key arrives per reveal call and is never persisted. */
export class SecretVault extends DurableObject<Env> {
  async store(record: StoredSecret): Promise<void> {
    if (await this.ctx.storage.get(STORAGE_KEY)) throw new Error("Secret id already in use");
    await this.ctx.storage.put(STORAGE_KEY, record);
    await this.ctx.storage.setAlarm(record.expiresAt);
  }

  async status(): Promise<SecretStatus> {
    const record = await this.load();
    return { exists: record !== null, expiresAt: record?.expiresAt ?? null };
  }

  /** Decrypts and deletes in one step; a wrong key leaves the secret intact. */
  async reveal(key: string): Promise<RevealResult> {
    // decrypt() is not a storage op, so input gates alone would let a concurrent reveal interleave
    // between read and delete. Blocking makes "read once" hold under concurrent requests.
    return this.ctx.blockConcurrencyWhile(async (): Promise<RevealResult> => {
      const record = await this.load();
      if (!record) return { ok: false, code: "NOT_FOUND" };

      const secret = await decryptSecret(record, key);
      if (secret === null) return { ok: false, code: "INVALID_KEY" };

      await this.destroy();
      return { ok: true, secret };
    });
  }

  async alarm(): Promise<void> {
    await this.destroy();
  }

  private async load(): Promise<StoredSecret | null> {
    const record = await this.ctx.storage.get<StoredSecret>(STORAGE_KEY);
    if (!record) return null;
    if (record.expiresAt <= Date.now()) {
      await this.destroy();
      return null;
    }
    return record;
  }

  private async destroy(): Promise<void> {
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();
  }
}
