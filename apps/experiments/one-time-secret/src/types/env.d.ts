/// <reference types="@cloudflare/workers-types" />

import type { SecretVault } from "../secret-vault";

export interface Env {
  SECRETS: DurableObjectNamespace<SecretVault>;
}
