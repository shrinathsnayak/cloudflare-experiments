import type { FlagshipBooleanDetails, FlagshipEvaluationContext } from "./env";

export type FlagValueResponse = {
  flagKey: string;
  value: boolean;
  context: FlagshipEvaluationContext;
};

export type FlagDetailsResponse = FlagshipBooleanDetails & {
  context: FlagshipEvaluationContext;
};
