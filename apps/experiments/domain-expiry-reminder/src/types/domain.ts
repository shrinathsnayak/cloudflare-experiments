export type ExpiryKind = "registration" | "certificate";

export type RegistrationInfo = {
  expiresAt: string;
  daysLeft: number;
  registrar?: string;
};

export type CertificateInfo = {
  expiresAt: string;
  daysLeft: number;
  issuer: string;
};

export type DomainStatus = {
  domain: string;
  checkedAt: string;
  registration: RegistrationInfo | null;
  certificate: CertificateInfo | null;
  errors?: Partial<Record<ExpiryKind, string>>;
};

export type CreateDomainBody = {
  domain?: unknown;
  alertEmail?: unknown;
};

export type DomainRow = {
  id: number;
  domain: string;
  alert_email: string;
  registration_expires_at: string | null;
  certificate_expires_at: string | null;
  last_checked_at: number | null;
  created_at: number;
};

export type DomainResponse = {
  id: number;
  domain: string;
  alertEmail: string;
  createdAt: string;
};

export type RdapBootstrap = {
  services?: Array<[string[], string[]]>;
};

export type RdapEvent = {
  eventAction?: string;
  eventDate?: string;
};

export type RdapEntity = {
  roles?: string[];
  vcardArray?: [string, Array<[string, Record<string, unknown>, string, unknown]>];
};

export type RdapDomain = {
  events?: RdapEvent[];
  entities?: RdapEntity[];
};

export type CrtShEntry = {
  issuer_name?: string;
  common_name?: string;
  name_value?: string;
  not_before?: string;
  not_after?: string;
};

export type ReminderCheckSummary = {
  processed: number;
  remindersSent: number;
  failures: number;
};
