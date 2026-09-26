export type SendEmailRequest = {
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
};

export type SendEmailResponse = {
  sent: true;
  to: string;
  subject: string;
  messageId?: string;
};
