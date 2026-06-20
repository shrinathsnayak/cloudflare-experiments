export interface MetadataResponse {
  title: string | null;
  description: string | null;
  canonical: string | null;
  og: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
    url?: string;
    siteName?: string;
  };
}
