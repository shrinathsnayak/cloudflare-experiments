export type RunRequest = {
  code?: string;
};

export type RunResult = {
  status: number;
  body: unknown;
};
