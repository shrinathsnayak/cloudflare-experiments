import { IMPACT_WEIGHTS, MAX_HTML_LENGTH, MAX_NODES_PER_VIOLATION } from "../constants/defaults";
import type { AuditReport, ImpactCounts, RawAxeNode, RawAxeResults } from "../types/audit";

export function truncate(text: string, max: number = MAX_HTML_LENGTH): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function flattenTarget(target: RawAxeNode["target"]): string[] {
  return target.map((part) => (Array.isArray(part) ? part.join(" >>> ") : part));
}

/**
 * Weighted pass ratio: each violated rule costs IMPACT_WEIGHTS[impact] "passes".
 * 100 means no violations; rules without an impact count as minor.
 */
export function computeScore(passes: number, counts: ImpactCounts): number {
  const penalty =
    counts.critical * IMPACT_WEIGHTS.critical +
    counts.serious * IMPACT_WEIGHTS.serious +
    counts.moderate * IMPACT_WEIGHTS.moderate +
    counts.minor * IMPACT_WEIGHTS.minor;
  if (penalty === 0) return 100;
  return Math.round((100 * passes) / (passes + penalty));
}

export function summarizeAxeResults(url: string, raw: RawAxeResults): AuditReport {
  const counts: ImpactCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const violation of raw.violations) {
    counts[violation.impact ?? "minor"] += 1;
  }

  const violations = raw.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    helpUrl: violation.helpUrl,
    totalNodes: violation.nodes.length,
    nodes: violation.nodes.slice(0, MAX_NODES_PER_VIOLATION).map((node) => ({
      target: flattenTarget(node.target),
      html: truncate(node.html),
    })),
  }));

  return {
    url,
    score: computeScore(raw.passes, counts),
    counts,
    violations,
    passes: raw.passes,
    incomplete: raw.incomplete,
  };
}
