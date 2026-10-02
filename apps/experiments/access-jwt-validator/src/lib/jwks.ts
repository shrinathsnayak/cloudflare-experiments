import { createRemoteJWKSet, type JWTVerifyGetKey } from "jose";
import { ACCESS_CERTS_PATH } from "../constants/defaults";

// Module scope so the fetched keys are reused across requests in the same isolate.
const keySets = new Map<string, JWTVerifyGetKey>();

/** Returns a cached remote JWKS for `<teamDomain>/cdn-cgi/access/certs`. */
export function getRemoteKeySet(teamDomain: string): JWTVerifyGetKey {
  let keySet = keySets.get(teamDomain);
  if (!keySet) {
    keySet = createRemoteJWKSet(new URL(`${teamDomain}${ACCESS_CERTS_PATH}`));
    keySets.set(teamDomain, keySet);
  }
  return keySet;
}
