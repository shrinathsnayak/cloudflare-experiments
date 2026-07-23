export type InboxMessage = {
  id: string;
  from: string;
  to: string;
  subject: string;
  receivedAt: string;
  text?: string;
  html?: string;
  messageId?: string;
  rejected?: boolean;
  rejectReason?: string;
};

export type InboxListResponse = {
  count: number;
  messages: InboxMessage[];
};
