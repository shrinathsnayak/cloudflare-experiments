export type LinkResult = {
  href: string;
  statusCode: number;
  ok: boolean;
  error?: string;
};

export type CheckResponse = {
  url: string;
  checked: number;
  broken: number;
  links: LinkResult[];
};
