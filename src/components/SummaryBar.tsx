import type { ScanResult } from "../types";
import { SEVERITY, IMPACT_KEYS } from "../severity";

export default function SummaryBar({ result }: { result: ScanResult }) {
  const { summary } = result;
  const when = new Date(result.scannedAt).toLocaleString();

  return (
    <section aria-labelledby="summary-heading">
      <div className="mb-4">
        <h2
          id="summary-heading"
          className="text-2xl font-bold text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {summary.total === 0
            ? "No automated issues found"
            : `${summary.total} accessibility ${summary.total === 1 ? "issue" : "issues"} found`}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {result.pageTitle ? `${result.pageTitle} · ` : ""}
          <span className="break-all">{result.finalUrl}</span> · scanned {when}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {IMPACT_KEYS.map((key) => {
          const meta = SEVERITY[key];
          const count = summary[key];
          return (
            <div
              key={key}
              className={`rounded-xl border border-line bg-surface p-4 ${count > 0 ? "" : "opacity-55"}`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${meta.rail}`} />
                <span
                  className="text-sm font-semibold text-ink"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {meta.label}
                </span>
              </div>
              <div
                className="mt-2 text-3xl font-bold text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {count}
              </div>
              <p className="mt-1 text-xs leading-snug text-muted">
                {meta.blurb}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-brand/25 bg-brand/5 p-4">
        <p className="text-sm leading-relaxed text-ink">
          <strong className="font-semibold">
            What this scan does and doesn't cover.
          </strong>{" "}
          Automated testing reliably catches roughly 30–50% of WCAG issues — the
          machine-checkable ones like contrast, missing labels, and broken
          structure. Judgement calls, like whether alt text is meaningful or
          whether a page reads in a logical order, still need a human reviewer.
          A complete audit pairs this scan with manual review.
        </p>
        <p className="mt-2 text-xs text-muted">
          {summary.passes} automated checks passed · {summary.incomplete} need
          manual confirmation.
        </p>
      </div>
    </section>
  );
}
