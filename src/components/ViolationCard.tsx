import { useState } from "react";
import type { TranslatedViolation } from "../types";
import { SEVERITY } from "../severity";

export default function ViolationCard({ v }: { v: TranslatedViolation }) {
  const [open, setOpen] = useState(false);
  const meta = SEVERITY[v.impact];

  return (
    <article className="relative overflow-hidden rounded-xl border border-line bg-surface">
      <span
        aria-hidden
        className={`absolute left-0 top-0 h-full w-1.5 ${meta.rail}`}
      />
      <div className="p-5 pl-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.bg} ${meta.text}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {meta.label}
          </span>
          {v.wcag.criteria.map((c) => (
            <span
              key={c}
              className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              WCAG {c}
            </span>
          ))}
          {v.wcag.level !== "—" && (
            <span
              className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Level {v.wcag.level}
            </span>
          )}
          <span className="ml-auto text-xs text-muted">
            Found in {v.nodeCount} {v.nodeCount === 1 ? "place" : "places"}
          </span>
        </div>

        <h3
          className="mt-3 text-lg font-semibold text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {v.plainTitle}
        </h3>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wide text-muted"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What this means for residents
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink">
              {v.residentImpact}
            </p>
          </div>
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wide text-muted"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How to fix it
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink">{v.fix}</p>
          </div>
        </div>

        {v.sampleSelectors.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="text-sm font-semibold text-brand hover:text-brand-deep"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {open ? "Hide" : "Show"} affected elements
            </button>
            {open && (
              <div className="mt-2 space-y-2 rounded-lg bg-canvas p-3">
                {v.sampleSelectors.map((sel, i) => (
                  <code
                    key={i}
                    className="block break-all text-xs text-ink"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {sel}
                  </code>
                ))}
                {v.sampleHtml && (
                  <pre
                    className="mt-2 overflow-x-auto rounded bg-ink/90 p-3 text-xs leading-relaxed text-white"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {v.sampleHtml}
                  </pre>
                )}
                <a
                  href={v.helpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block pt-1 text-xs font-semibold text-brand hover:text-brand-deep"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Technical reference for {v.id} ↗
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
