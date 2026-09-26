/// <reference types="@cloudflare/workers-types" />

/** Secrets Store secret binding. */
export interface SecretsStoreSecret {
  get(): Promise<string>;
}

export interface Env {
  API_KEY: SecretsStoreSecret;
}
