export type ItemRow = {
  id: number;
  from_address: string;
  from_name: string | null;
  subject: string;
  summary: string;
  link: string | null;
  received_at: number;
  digested_at: number | null;
};

export type NewItem = {
  fromAddress: string;
  fromName: string | null;
  subject: string;
  summary: string;
  link: string | null;
};

export type ItemResponse = {
  id: number;
  from: string;
  fromName: string | null;
  subject: string;
  summary: string;
  link: string | null;
  receivedAt: string;
  digestedAt: string | null;
};

export type Digest = {
  subject: string;
  text: string;
  html: string;
  itemCount: number;
  senderCount: number;
};

export type DigestRunResult = {
  sent: boolean;
  itemCount: number;
  messageId?: string;
};

export type InboundResult =
  | { status: "stored"; id: number }
  | { status: "ignored"; reason: string }
  | { status: "rejected"; reason: string };
