/** Response for list operations. */
export type ListResponse = {
  objects: Array<{
    key: string;
    size: number;
    etag: string;
    uploaded: string;
    customMetadata?: Record<string, string>;
  }>;
  truncated: boolean;
  cursor?: string;
};

/** Response for get (metadata only, no body). */
export type HeadResponse = {
  key: string;
  size: number;
  etag: string;
  uploaded: string;
  customMetadata?: Record<string, string>;
  httpMetadata?: { contentType?: string };
};
