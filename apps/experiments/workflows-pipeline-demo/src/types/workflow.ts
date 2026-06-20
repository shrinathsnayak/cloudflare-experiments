export type PipelineParams = {
  url: string;
};

export type FetchedPage = {
  url: string;
  title: string | null;
  text: string;
};

export type PipelineResult = {
  url: string;
  summary: string;
  r2Key: string;
};

export type RunResponse = {
  instanceId: string;
  status: string;
};

export type StatusResponse = {
  instanceId: string;
  status: string;
  output: PipelineResult | null;
  error: string | null;
};
