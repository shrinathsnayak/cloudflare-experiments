import type { DNS_RECORD_TYPES, HASH_ALGORITHMS } from "../constants/defaults";

export type DnsRecordType = (typeof DNS_RECORD_TYPES)[number];
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

export interface DnsAnswer {
  name: string;
  type: number;
  ttl: number;
  data: string;
}

export interface DnsLookupResult {
  name: string;
  type: DnsRecordType;
  status: number;
  answers: DnsAnswer[];
}

export interface HttpHeadersResult {
  url: string;
  finalUrl: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface UptimeResult {
  url: string;
  up: boolean;
  status: number | null;
  latencyMs: number;
  error?: string;
}

export interface HashResult {
  algorithm: HashAlgorithm;
  hex: string;
}
