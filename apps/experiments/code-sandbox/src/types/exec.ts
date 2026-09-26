export type ExecLanguage = "javascript";

export type ExecRequest = {
  language?: string;
  code?: string;
};

export type ExecResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};
