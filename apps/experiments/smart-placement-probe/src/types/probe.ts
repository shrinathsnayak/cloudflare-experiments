export type ProbeResult = {
  url: string;
  status: number;
  latencyMs: number;
  cf: {
    colo?: string;
  };
  workerPlacement: string;
  error?: string;
};
