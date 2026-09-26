export type SaveScriptRequest = {
  name: string;
  response: Record<string, unknown>;
};

export type ScriptRecord = {
  name: string;
  response: Record<string, unknown>;
  updatedAt: string;
};

export type RegisterCustomerRequest = {
  name: string;
};
