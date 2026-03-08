export interface WebsiteApiResponse {
  title: string | null;
  headings: { level: number; text: string }[];
  links: string[];
  images: string[];
}
