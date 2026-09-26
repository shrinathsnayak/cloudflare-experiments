export type MarkdownResponse = {
  url: string;
  markdown: string;
};

export type ScrapeElementMatch = {
  text?: string;
  html?: string;
  attributes?: { name: string; value: string }[];
  height?: number;
  width?: number;
  top?: number;
  left?: number;
};

export type ScrapeSelectorResult = {
  selector: string;
  results: ScrapeElementMatch[];
};

export type ScrapeResponse = {
  url: string;
  results: ScrapeSelectorResult[];
};

export type QuickActionPayload = {
  success?: boolean;
  result?: unknown;
  error?: string;
};
