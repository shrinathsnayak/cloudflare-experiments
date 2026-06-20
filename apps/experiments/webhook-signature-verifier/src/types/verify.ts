export type VerifyAlgorithm = "sha256" | "hmac-sha256";

export type VerifyRequest = {
  payload: string;
  secret: string;
  signature: string;
  algorithm?: VerifyAlgorithm;
};

export type VerifyResponse = {
  match: boolean;
  algorithm: VerifyAlgorithm;
  expectedSignature: string;
  providedSignature: string;
  signatureFormat: "prefixed-hex" | "raw-hex";
  explanation: string;
};
