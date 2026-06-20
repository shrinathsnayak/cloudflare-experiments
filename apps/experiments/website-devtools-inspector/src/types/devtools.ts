export interface DevtoolsResponse {
  url: string;
  statusCode: number;
  responseTimeMs: number;
  headers: Record<string, string>;
  cookies: string[];
  metadata: {
    title: string | null;
    description: string | null;
    canonical: string | null;
  };
  scripts: string[];
  stylesheets: string[];
  images: string[];
  links: string[];
}
