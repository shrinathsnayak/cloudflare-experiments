export type ChatRequestBody = {
  model: string;
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
  max_tokens?: number;
};

export type ChatResponse = {
  response: string;
};
