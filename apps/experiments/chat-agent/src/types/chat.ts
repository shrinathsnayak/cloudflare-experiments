export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: number;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type ChatPostRequest = {
  sessionId?: string;
  message?: string;
};

export type ChatPostResponse = {
  sessionId: string;
  messages: ChatMessage[];
};

export type ChatHistoryResponse = {
  sessionId: string;
  messages: ChatMessage[];
};
