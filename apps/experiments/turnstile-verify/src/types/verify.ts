export interface VerifyRequest {
  token?: unknown;
}

export interface VerifyResponse {
  success: boolean;
  errorCodes?: string[];
  hostname?: string;
  action?: string;
}

export interface TurnstileSiteverifyPayload {
  success: boolean;
  "error-codes"?: string[];
  hostname?: string;
  action?: string;
}
