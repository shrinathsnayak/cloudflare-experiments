/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Needs a Durable Object binding SECRETS -> SecretVault (migration: new_sqlite_classes).
 * The key is returned to the caller only; the Durable Object stores ciphertext + IV.
 */
import { encryptSecret, generateId } from "../src/lib/crypto";
import type { Env } from "../src/types/env";

export { SecretVault } from "../src/secret-vault";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const vault = (id: string) => env.SECRETS.get(env.SECRETS.idFromName(id));

    if (request.method === "POST" && url.pathname === "/secrets") {
      const { secret } = (await request.json()) as { secret: string };
      const id = generateId();
      const { key, ciphertext, iv } = await encryptSecret(secret);
      await vault(id).store({ ciphertext, iv, expiresAt: Date.now() + 3600_000 });
      return Response.json({ id, key }, { status: 201 });
    }

    const reveal = url.pathname.match(/^\/secrets\/([\w-]+)\/reveal$/);
    if (request.method === "POST" && reveal) {
      const { key } = (await request.json()) as { key: string };
      const result = await vault(reveal[1]).reveal(key);
      return result.ok
        ? Response.json({ secret: result.secret })
        : Response.json({ code: result.code }, { status: result.code === "NOT_FOUND" ? 404 : 400 });
    }

    return new Response("Not found", { status: 404 });
  },
};
