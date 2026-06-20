export interface HeartbeatStatus {
  lastRun: string | null;
  lastCron: string | null;
  runCount: number;
}
