export type FeedItem = {
  title: string;
  link?: string;
  id?: string;
  published?: string;
  summary?: string;
  author?: string;
};

export type FeedResponse = {
  url: string;
  format: "rss" | "atom" | "unknown";
  title?: string;
  description?: string;
  link?: string;
  itemCount: number;
  items: FeedItem[];
};
