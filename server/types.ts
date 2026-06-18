export type Impact = "critical" | "serious" | "moderate" | "minor";

export interface WcagRef {
  criteria: string[];      // e.g. ["1.1.1"]
  level: "A" | "AA" | "AAA" | "—";
}

export interface TranslatedViolation {
  id: string;
  impact: Impact;
  plainTitle: string;      // plain-language title
  residentImpact: string;  // what it means for a resident
  fix: string;             // plain next step
  wcag: WcagRef;
  helpUrl: string;
  nodeCount: number;
  sampleSelectors: string[];
  sampleHtml: string;
}

export interface ScanSummary {
  total: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  passes: number;
  incomplete: number;
}

export interface ScanResult {
  url: string;
  finalUrl: string;
  scannedAt: string;
  pageTitle: string;
  summary: ScanSummary;
  violations: TranslatedViolation[];
}