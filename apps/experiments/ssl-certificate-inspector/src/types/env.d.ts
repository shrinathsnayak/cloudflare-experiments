export interface Env {}

export type CertificateInfo = {
  issuer: string;
  subject: string;
  notBefore: string;
  notAfter: string;
  daysUntilExpiry: number;
  san: string[];
  serialNumber?: string;
};

export type InspectResponse = {
  domain: string;
  reachable: boolean;
  tlsVersion?: string;
  certificate: CertificateInfo | null;
  source: "certificate-transparency";
  note: string;
};
