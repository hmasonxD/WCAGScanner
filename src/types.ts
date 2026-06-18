export type Impact = "critical" | "serious" | "moderate" | "minor";
export interface WcagRef { criteria: string[]; level: "A" | "AA" | "AAA" | "—"; }
export interface TranslatedViolation {
  id: string; impact: Impact; plainTitle: string; residentImpact: string; fix: string;
  wcag: WcagRef; helpUrl: string; nodeCount: number; sampleSelectors: string[]; sampleHtml: string;
}
export interface ScanSummary {
  total: number; critical: number; serious: number; moderate: number; minor: number;
  passes: number; incomplete: number;
}
export interface ScanResult {
  url: string; finalUrl: string; scannedAt: string; pageTitle: string;
  summary: ScanSummary; violations: TranslatedViolation[];
}