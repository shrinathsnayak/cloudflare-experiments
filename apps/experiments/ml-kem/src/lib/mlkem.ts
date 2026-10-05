export async function generateKeyPairAndTest() {
  const keyPair = (await crypto.subtle.generateKey(
    {
      name: "ML-KEM",
      namedCurve: "ML-KEM-768",
    },
    true,
    ["deriveBits"]
  )) as CryptoKeyPair;

  const publicKeyExported = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const publicKeyHex = arrayBufferToHex(publicKeyExported);

  const { ciphertext, sharedSecret: encapsulatedSecret } = await crypto.subtle.encapsulate(
    keyPair.publicKey
  );

  const ciphertextHex = arrayBufferToHex(ciphertext);
  const encapsulatedSecretHex = arrayBufferToHex(encapsulatedSecret);

  const decapsulatedSecret = await crypto.subtle.decapsulate(keyPair.privateKey, ciphertext);

  const decapsulatedSecretHex = arrayBufferToHex(decapsulatedSecret);

  const secretsMatch = encapsulatedSecretHex === decapsulatedSecretHex;

  return {
    algorithm: "ML-KEM-768",
    publicKey: publicKeyHex,
    ciphertext: ciphertextHex,
    encapsulatedSecret: encapsulatedSecretHex.substring(0, 32) + "...",
    decapsulatedSecret: decapsulatedSecretHex.substring(0, 32) + "...",
    secretsMatch,
    publicKeyLength: publicKeyExported.byteLength,
    ciphertextLength: ciphertext.byteLength,
    sharedSecretLength: decapsulatedSecret.byteLength,
  };
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
