export type ReadabilityExtractResponse = {
  url: string;
  title: string;
  author: string | null;
  body: string;
  wordCount: number;
  readTimeMinutes: number;
};

export type RawReadabilityContent = {
  title: string;
  author: string | null;
  body: string;
};
