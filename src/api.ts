import type { ScanResult } from "./types";

export async function runScan(url: string): Promise<ScanResult> {
  const res = await fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Something went wrong. Try again.");
  return data as ScanResult;
}