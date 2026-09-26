export type HelloResponse = {
  message: string;
  servedBy: "worker";
};

export type InfoResponse = {
  name: string;
  description: string;
  assetsBinding: boolean;
};
