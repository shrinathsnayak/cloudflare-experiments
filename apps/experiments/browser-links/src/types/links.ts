export type PageLink = {
  href: string;
  text: string;
};

export type LinksResponse = {
  url: string;
  linkCount: number;
  truncated: boolean;
  links: PageLink[];
};
