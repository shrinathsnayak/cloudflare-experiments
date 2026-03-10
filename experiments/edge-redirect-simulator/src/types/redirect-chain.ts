export type RedirectChainStep = {
  url: string;
  status: number;
};

export type RedirectChainResponse = {
  chain: RedirectChainStep[];
};
