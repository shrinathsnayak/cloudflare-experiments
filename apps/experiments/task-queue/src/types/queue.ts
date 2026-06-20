export interface TaskMessage {
  message: string;
  enqueuedAt: string;
}

export interface QueueStats {
  enqueued: number;
  processed: number;
}

export interface EnqueueResult {
  queued: boolean;
  message: string;
  enqueuedAt: string;
}
