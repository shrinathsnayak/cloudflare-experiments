export type IceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

export type TurnCredentialsResponse = {
  iceServers: IceServer[];
  ttl: number;
  mode: "live" | "demo";
  note?: string;
};

export type GenerateIceServersApiResponse = {
  iceServers: IceServer[];
};
