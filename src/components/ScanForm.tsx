import { useState } from "react";

interface Props {
  onScan: (url: string) => void;
  loading: boolean;
}

export default function ScanForm({ onScan, loading }: Props) {
  const [url, setUrl] = useState("");

  function submit() {
    const trimmed = url.trim();
    if (!trimmed) return;
    // Forgiving: let people paste "townofx.ca" without the scheme.
    const withScheme = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    onScan(withScheme);
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-2 shadow-sm sm:flex sm:items-center sm:gap-2">
      <label htmlFor="url" className="sr-only">
        Website address to scan
      </label>
      <input
        id="url"
        type="url"
        inputMode="url"
        placeholder="Paste a website address, e.g. www.yourtown.ca"
        value={url}
        disabled={loading}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className="w-full flex-1 rounded-xl bg-transparent px-4 py-3 text-ink placeholder:text-muted/70 focus:outline-none disabled:opacity-60"
      />
      <button
        type="button"
        onClick={submit}
        disabled={loading || !url.trim()}
        className="mt-2 w-full rounded-xl bg-brand px-6 py-3 font-[var(--font-display)] font-semibold text-white transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0 sm:w-auto"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {loading ? "Scanning…" : "Scan site"}
      </button>
    </div>
  );
}
