export type SecretStatusConfigured = {
  configured: true;
  length: number;
  preview: string;
};

export type SecretStatusMissing = {
  configured: false;
};

export type SecretStatus = SecretStatusConfigured | SecretStatusMissing;

export type SecretVerifyResponse = {
  match: boolean;
};
