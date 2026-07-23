import type {
  AuthStatus,
  CheckResponse,
  DkimResult,
  DmarcResult,
  MxRecord,
  SpfResult,
} from "../types/check";
import { DKIM_SELECTORS } from "../constants/defaults";
import { queryDoh } from "./doh";

function parseMx(records: string[]): MxRecord[] {
  return records
    .map((data) => {
      const parts = data.trim().split(/\s+/);
      if (parts.length < 2) return null;
      const priority = Number.parseInt(parts[0], 10);
      const exchange = parts[1].replace(/\.$/, "");
      if (!Number.isFinite(priority)) return null;
      return { priority, exchange };
    })
    .filter((r): r is MxRecord => r !== null)
    .sort((a, b) => a.priority - b.priority);
}

function analyzeSpf(txtRecords: string[]): SpfResult {
  const spf = txtRecords.find((r) => r.toLowerCase().startsWith("v=spf1"));
  if (!spf) {
    return {
      status: "missing",
      detail: "No SPF TXT record (v=spf1) found",
    };
  }
  if (/\+all\b/i.test(spf)) {
    return {
      status: "warn",
      record: spf,
      detail: "SPF ends with +all (too permissive)",
    };
  }
  if (/[?]all\b/i.test(spf)) {
    return {
      status: "warn",
      record: spf,
      detail: "SPF ends with ?all (neutral; prefer ~all or -all)",
    };
  }
  return {
    status: "pass",
    record: spf,
    detail: "SPF record present",
  };
}

function analyzeDmarc(txtRecords: string[]): DmarcResult {
  const dmarc = txtRecords.find((r) => r.toLowerCase().startsWith("v=dmarc1"));
  if (!dmarc) {
    return {
      status: "missing",
      detail: "No DMARC record found at _dmarc.<domain>",
    };
  }
  const policyMatch = /;\s*p=([a-z]+)/i.exec(dmarc) ?? /^v=dmarc1;\s*p=([a-z]+)/i.exec(dmarc);
  const policy = policyMatch?.[1]?.toLowerCase();
  if (!policy || policy === "none") {
    return {
      status: "warn",
      record: dmarc,
      policy: policy ?? "none",
      detail: "DMARC policy is none (monitoring only)",
    };
  }
  return {
    status: "pass",
    record: dmarc,
    policy,
    detail: `DMARC policy is ${policy}`,
  };
}

async function analyzeDkim(domain: string): Promise<DkimResult> {
  const found: DkimResult["found"] = [];

  await Promise.all(
    DKIM_SELECTORS.map(async (selector) => {
      const name = `${selector}._domainkey.${domain}`;
      try {
        const records = await queryDoh(name, "TXT");
        const dkim = records.find((r) => /v=DKIM1/i.test(r) || /p=/i.test(r));
        if (dkim) {
          found.push({ selector, found: true, record: dkim });
        } else {
          found.push({ selector, found: false });
        }
      } catch {
        found.push({ selector, found: false });
      }
    })
  );

  const hits = found.filter((f) => f.found);
  if (hits.length === 0) {
    return {
      status: "warn",
      selectorsChecked: [...DKIM_SELECTORS],
      found,
      detail:
        "No DKIM keys found for common selectors (google, selector1, selector2, default, k1). Other selectors may still exist.",
    };
  }
  return {
    status: "pass",
    selectorsChecked: [...DKIM_SELECTORS],
    found,
    detail: `Found DKIM for selector(s): ${hits.map((h) => h.selector).join(", ")}`,
  };
}

function summarize(
  mx: MxRecord[],
  spf: SpfResult,
  dmarc: DmarcResult,
  dkim: DkimResult
): CheckResponse["summary"] {
  const issues: string[] = [];
  if (mx.length === 0) issues.push("No MX records");
  if (spf.status === "missing" || spf.status === "fail") issues.push(spf.detail);
  else if (spf.status === "warn") issues.push(spf.detail);
  if (dmarc.status === "missing" || dmarc.status === "fail") issues.push(dmarc.detail);
  else if (dmarc.status === "warn") issues.push(dmarc.detail);
  if (dkim.status === "warn" || dkim.status === "fail" || dkim.status === "missing") {
    issues.push(dkim.detail);
  }

  let status: AuthStatus = "pass";
  if (mx.length === 0 || spf.status === "missing" || dmarc.status === "missing") {
    status = "fail";
  } else if (
    spf.status === "warn" ||
    dmarc.status === "warn" ||
    dkim.status === "warn" ||
    dkim.status === "missing"
  ) {
    status = "warn";
  }

  return { status, issues };
}

/**
 * Look up MX/TXT/DMARC/DKIM via DoH and analyze email authentication posture.
 */
export async function checkEmailAuth(domain: string): Promise<CheckResponse> {
  const [mxRaw, txtRaw, dmarcRaw] = await Promise.all([
    queryDoh(domain, "MX"),
    queryDoh(domain, "TXT"),
    queryDoh(`_dmarc.${domain}`, "TXT"),
  ]);

  const mx = parseMx(mxRaw);
  const spf = analyzeSpf(txtRaw);
  const dmarc = analyzeDmarc(dmarcRaw);
  const dkim = await analyzeDkim(domain);

  return {
    domain,
    mx,
    spf,
    dmarc,
    dkim,
    summary: summarize(mx, spf, dmarc, dkim),
  };
}

// Exported for unit tests
export { parseMx, analyzeSpf, analyzeDmarc };
