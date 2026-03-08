/** Single DNS record in our API response. */
export type DnsRecord = {
  name: string;
  type: string;
  ttl: number;
  data: string;
};

/** DNS lookup API response: hostname and records grouped by type. */
export type DnsLookupResponse = {
  hostname: string;
  records: {
    A?: DnsRecord[];
    AAAA?: DnsRecord[];
    CNAME?: DnsRecord[];
    MX?: DnsRecord[];
    NS?: DnsRecord[];
    TXT?: DnsRecord[];
    SOA?: DnsRecord[];
    CAA?: DnsRecord[];
  };
};

/** Cloudflare DoH JSON API answer entry. */
export type DohAnswer = {
  name: string;
  type: number;
  TTL: number;
  data: string;
};

/** Cloudflare DoH JSON API response. */
export type DohResponse = {
  Status: number;
  Answer?: DohAnswer[];
};
