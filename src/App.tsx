import { useState } from "react";
import ScanForm from "./components/ScanForm";
import SummaryBar from "./components/SummaryBar";
import ViolationCard from "./components/ViolationCard";
import { runScan } from "./api";
import type { ScanResult } from "./types";

type State =
  | { phase: "idle" }
  | { phase: "loading"; url: string }
  | { phase: "done"; result: ScanResult }
  | { phase: "error"; message: string };

export default function App() {
  const [state, setState] = useState<State>({ phase: "idle" });

  async function handleScan(url: string) {
    setState({ phase: "loading", url });
    try {
      setState({ phase: "done", result: await runScan(url) });
    } catch (err) {
      setState({
        phase: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  }

  const display = { fontFamily: "var(--font-display)" };

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-4">
          <p
            className="text-lg font-bold leading-none text-ink"
            style={display}
          >
            AccessScan
          </p>
          <p className="text-xs text-muted">
            Automated WCAG auditing for public-sector websites
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
        <h1
          className="text-3xl font-bold leading-tight text-ink sm:text-4xl"
          style={display}
        >
          See your site the way every resident does.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          Enter a public website and AccessScan checks it against the WCAG
          standards that govern accessible government services, then explains
          what it finds in plain language.
        </p>

        <div className="mt-6">
          <ScanForm onScan={handleScan} loading={state.phase === "loading"} />
        </div>

        <div className="mt-8 space-y-6">
          {state.phase === "idle" && (
            <div className="rounded-2xl border border-dashed border-line px-6 py-12 text-center text-sm text-muted">
              Paste any public website address above to run a live accessibility
              scan.
            </div>
          )}
          {state.phase === "loading" && (
            <div className="rounded-2xl border border-line bg-surface px-6 py-12 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-brand" />
              <p className="font-semibold text-ink" style={display}>
                Loading the page in a real browser…
              </p>
              <p className="mt-2 break-all text-sm text-muted">
                Rendering {state.url} and running the audit.
              </p>
            </div>
          )}
          {state.phase === "error" && (
            <div className="rounded-2xl border border-critical/30 bg-critical/5 px-6 py-8 text-center">
              <p className="font-semibold text-critical" style={display}>
                Couldn't complete the scan
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink">
                {state.message}
              </p>
            </div>
          )}
          {state.phase === "done" && (
            <>
              <SummaryBar result={state.result} />
              {state.result.violations.map((v, i) => (
                <ViolationCard key={`${v.id}-${i}`} v={v} />
              ))}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
