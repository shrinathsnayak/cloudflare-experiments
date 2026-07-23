export type CheckStatus = "pass" | "warn" | "fail" | "missing";

export type HeaderCheck = {
  header: string;
  status: CheckStatus;
  detail: string;
  recommendation: string;
};

export type GradeResponse = {
  url: string;
  score: number;
  grade: string;
  checks: HeaderCheck[];
  headers: Record<string, string>;
};
