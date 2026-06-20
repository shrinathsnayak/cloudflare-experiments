export type TrackRequestBody = {
  url: string;
};

export type TrackResponse = {
  url: string;
  id: number;
  createdAt: string;
};

export type SnapshotHistoryEntry = {
  id: number;
  contentHash: string;
  diffSummary: string | null;
  createdAt: string;
};

export type HistoryResponse = {
  url: string;
  snapshots: SnapshotHistoryEntry[];
};

export type TrackedUrlRow = {
  id: number;
  url: string;
  created_at: number;
};

export type SnapshotRow = {
  id: number;
  tracked_url_id: number;
  content_hash: string;
  diff_summary: string | null;
  r2_key: string;
  created_at: number;
};
