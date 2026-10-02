export type Impact = "critical" | "serious" | "moderate" | "minor";

/** Slim subset of axe-core results returned from the page. */
export type RawAxeNode = {
  target: (string | string[])[];
  html: string;
};

export type RawAxeViolation = {
  id: string;
  impact: Impact | null;
  help: string;
  helpUrl: string;
  nodes: RawAxeNode[];
};

export type RawAxeResults = {
  violations: RawAxeViolation[];
  passes: number;
  incomplete: number;
};

export type PageAuditResult = {
  axe: RawAxeResults;
  imagesMissingAlt: string[];
};

export type ViolationNode = {
  target: string[];
  html: string;
};

export type Violation = {
  id: string;
  impact: Impact | null;
  help: string;
  helpUrl: string;
  totalNodes: number;
  nodes: ViolationNode[];
};

export type ImpactCounts = Record<Impact, number>;

export type AltSuggestion = {
  src: string;
  suggestion: string | null;
  error?: string;
};

export type AuditReport = {
  url: string;
  score: number;
  counts: ImpactCounts;
  violations: Violation[];
  passes: number;
  incomplete: number;
  altSuggestions?: AltSuggestion[];
};

export type AltTextResponse = {
  altText: string;
  model: string;
};
