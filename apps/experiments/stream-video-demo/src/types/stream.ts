export type UploadUrlResponse = {
  uploadURL: string;
  uid: string;
  mode: "live" | "demo";
  maxDurationSeconds: number;
};

export type PlaybackTokenResponse = {
  token: string;
  uid: string;
  playbackUrl: string;
  mode: "live" | "demo";
};

export type UploadUrlBody = {
  maxDurationSeconds?: number;
};
