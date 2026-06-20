interface SendEmail {
  send(message: {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }): Promise<{ messageId?: string }>;
}

interface Env {
  DB: D1Database;
  EMAILER: SendEmail;
  ALERT_FROM_EMAIL?: string;
}

export type { Env, SendEmail };
