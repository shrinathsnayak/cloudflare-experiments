/// <reference types="@cloudflare/workers-types" />

export type FlagshipEvaluationContext = Record<string, string | number | boolean>;

export type FlagshipBooleanDetails = {
  flagKey: string;
  value: boolean;
  variant?: string;
  reason?: string;
  errorCode?: string;
};

export interface Flagship {
  getBooleanValue(
    flagKey: string,
    defaultValue: boolean,
    context?: FlagshipEvaluationContext
  ): Promise<boolean>;
  getBooleanDetails(
    flagKey: string,
    defaultValue: boolean,
    context?: FlagshipEvaluationContext
  ): Promise<FlagshipBooleanDetails>;
}

export interface Env {
  FLAGS: Flagship;
}
