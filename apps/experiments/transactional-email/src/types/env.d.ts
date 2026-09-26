/// <reference types="@cloudflare/workers-types" />

export type SendEmail = {
  send(message: {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }): Promise<{ messageId?: string }>;
};

export interface Env {
  EMAIL: SendEmail;
  FROM_EMAIL: string;
}
