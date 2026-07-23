export type AuthStatus = "pass" | "warn" | "fail" | "missing";

export type MxRecord = {
  priority: number;
  exchange: string;
};

export type SpfResult = {
  status: AuthStatus;
  record?: string;
  detail: string;
};

export type DmarcResult = {
  status: AuthStatus;
  record?: string;
  policy?: string;
  detail: string;
};

export type DkimSelectorResult = {
  selector: string;
  found: boolean;
  record?: string;
};

export type DkimResult = {
  status: AuthStatus;
  selectorsChecked: string[];
  found: DkimSelectorResult[];
  detail: string;
};

export type CheckResponse = {
  domain: string;
  mx: MxRecord[];
  spf: SpfResult;
  dmarc: DmarcResult;
  dkim: DkimResult;
  summary: {
    status: AuthStatus;
    issues: string[];
  };
};
