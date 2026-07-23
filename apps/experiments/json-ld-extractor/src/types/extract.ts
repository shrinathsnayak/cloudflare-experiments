export type JsonLdBlock = {
  index: number;
  types: string[];
  data: unknown;
  parseError?: string;
};

export type ExtractResponse = {
  url: string;
  count: number;
  types: string[];
  blocks: JsonLdBlock[];
};
