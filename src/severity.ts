import type { Impact } from "./types";

export const SEVERITY: Record<Impact, { label: string; text: string; bg: string; rail: string; blurb: string }> = {
  critical: { label: "Critical", text: "text-critical", bg: "bg-critical/10", rail: "bg-critical", blurb: "Blocks people from using the page" },
  serious:  { label: "Serious",  text: "text-serious",  bg: "bg-serious/10",  rail: "bg-serious",  blurb: "Causes major difficulty for some users" },
  moderate: { label: "Moderate", text: "text-moderate", bg: "bg-moderate/10", rail: "bg-moderate", blurb: "A noticeable barrier worth fixing" },
  minor:    { label: "Minor",    text: "text-minor",    bg: "bg-minor/10",    rail: "bg-minor",    blurb: "Smaller issue, lower priority" },
};

export const IMPACT_KEYS: Impact[] = ["critical", "serious", "moderate", "minor"];