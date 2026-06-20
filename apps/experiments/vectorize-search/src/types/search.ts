export type UpsertRequest = {
  id: string;
  text: string;
};

export type UpsertResponse = {
  id: string;
};

export type SearchResult = {
  id: string;
  score: number;
  text: string;
};

export type SearchResponse = {
  query: string;
  results: SearchResult[];
};
