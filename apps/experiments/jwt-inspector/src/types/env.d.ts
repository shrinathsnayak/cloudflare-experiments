export interface Env {}

export type DecodeResponse = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
};

export type VerifyResponse = {
  valid: boolean;
  algorithm: string;
  payload: Record<string, unknown>;
};

export type IssueResponse = {
  token: string;
  payload: Record<string, unknown>;
};
