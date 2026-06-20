export type HtmlStats = {
  title: string | null;
  linkCount: number;
  imageCount: number;
  headingCounts: Record<string, number>;
};

export type TransformResponse = {
  url: string;
  banner: string;
  html: string;
};
