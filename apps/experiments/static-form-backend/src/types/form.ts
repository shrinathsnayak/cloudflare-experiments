export type FormFields = Record<string, string>;

export type ParsedSubmission = {
  fields: FormFields;
  turnstileToken: string | null;
  honeypotFilled: boolean;
};

export type ParseResult =
  | ({ ok: true } & ParsedSubmission)
  | { ok: false; code: string; message: string; status: 400 | 415 };

export type CreateFormBody = {
  ownerEmail?: unknown;
  allowedOrigin?: unknown;
  redirectUrl?: unknown;
};

export type FormRow = {
  id: string;
  owner_email: string;
  allowed_origin: string | null;
  redirect_url: string | null;
  created_at: number;
};

export type FormResponse = {
  id: string;
  ownerEmail: string;
  allowedOrigin: string | null;
  redirectUrl: string | null;
  endpoint: string;
  createdAt: string;
};

export type SubmissionRow = {
  id: number;
  form_id: string;
  fields: string;
  ip_hash: string | null;
  user_agent: string | null;
  created_at: number;
};

export type SubmissionResponse = {
  id: number;
  fields: FormFields;
  ipHash: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type TurnstileStatus = "passed" | "skipped";

export type SubmitResponse = {
  ok: true;
  id: number | null;
  turnstile: TurnstileStatus;
  emailed: boolean;
};

export type TurnstileSiteverifyPayload = {
  success: boolean;
  "error-codes"?: string[];
  hostname?: string;
};
