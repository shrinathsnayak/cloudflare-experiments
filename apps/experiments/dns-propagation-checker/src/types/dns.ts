export type RecordType = "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS";

export type ResolverResult = {
  resolver: string;
  ok: boolean;
  responseTimeMs: number;
  values: string[];
  error?: string;
};

export type PropagationResponse = {
  domain: string;
  type: RecordType;
  agreement: boolean;
  consensus: string[];
  resolvers: ResolverResult[];
};

export type DohAnswer = {
  name: string;
  type: number;
  TTL: number;
  data: string;
};

export type DohResponse = {
  Status: number;
  Answer?: DohAnswer[];
};
