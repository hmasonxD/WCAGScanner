import type { Impact, ScanSummary, TranslatedViolation } from "./types";

export function buildSummary(
  violations: TranslatedViolation[],
  passes: number,
  incomplete: number
): ScanSummary {
  const summary: ScanSummary = {
    total: violations.length,
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
    passes,
    incomplete,
  };
  for (const v of violations) {
    summary[v.impact as Impact] += 1;
  }
  return summary;
}