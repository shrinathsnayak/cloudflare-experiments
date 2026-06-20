export interface TrackRequest {
  event?: unknown;
  value?: unknown;
  tag?: unknown;
}

export interface TrackResponse {
  ok: true;
  event: string;
  value: number;
}
