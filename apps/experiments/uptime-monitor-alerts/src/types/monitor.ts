export type CreateMonitorBody = {
  url: string;
  alertEmail: string;
};

export type MonitorResponse = {
  id: number;
  url: string;
  alertEmail: string;
  lastStatus: "up" | "down" | null;
  createdAt: string;
};

export type CheckEntry = {
  id: number;
  ok: boolean;
  statusCode: number | null;
  responseTimeMs: number;
  error: string | null;
  checkedAt: string;
};

export type MonitorHistoryResponse = {
  id: number;
  url: string;
  alertEmail: string;
  uptimePercent: number;
  totalChecks: number;
  checks: CheckEntry[];
};

export type MonitorRow = {
  id: number;
  url: string;
  alert_email: string;
  last_status: string | null;
  created_at: number;
};

export type CheckRow = {
  id: number;
  monitor_id: number;
  ok: number;
  status_code: number | null;
  response_time_ms: number;
  error: string | null;
  checked_at: number;
};
