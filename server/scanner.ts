import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import type { ScanResult } from "./types";
import { translateViolation, sortByImpact, type RawAxeViolation } from "./translate";
import { buildSummary } from "./summary";

const NAV_TIMEOUT_MS = 30_000;

export function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function scanUrl(targetUrl: string): Promise<ScanResult> {
  // --no-sandbox / --disable-dev-shm-usage are needed to run Chromium in most containers.
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (AccessScan accessibility audit) AppleWebKit/537.36",
    });
    const page = await context.newPage();

    // networkidle so JavaScript-rendered content is included in the audit.
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: NAV_TIMEOUT_MS });

    const pageTitle = await page.title();
    const finalUrl = page.url();

    // Scope to WCAG 2.0/2.1 A and AA — the real-world legal benchmark.
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const violations = sortByImpact(
      (results.violations as unknown as RawAxeViolation[]).map(translateViolation)
    );

    return {
      url: targetUrl,
      finalUrl,
      scannedAt: new Date().toISOString(),
      pageTitle,
      summary: buildSummary(violations, results.passes?.length ?? 0, results.incomplete?.length ?? 0),
      violations,
    };
  } finally {
    await browser.close();
  }
}