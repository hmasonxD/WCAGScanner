import type { Impact, TranslatedViolation, WcagRef } from "./types";

interface RuleCopy {
  plainTitle: string;
  residentImpact: string;
  fix: string;
}

// This map is the part that's genuinely yours — the plain-language content that
// turns a developer tool into something a town clerk can act on. Rewrite the
// copy in your own voice; the fallback below means any rule you skip still works.
const RULE_COPY: Record<string, RuleCopy> = {
  "image-alt": {
    plainTitle: "Images are missing text descriptions",
    residentImpact:
      "Residents using a screen reader hear nothing where these images are, so any information the image carries is lost to them.",
    fix: "Add a short, meaningful description to each image; mark purely decorative images so screen readers skip them.",
  },
  "color-contrast": {
    plainTitle: "Text is hard to read against its background",
    residentImpact:
      "People with low vision, and anyone reading on a phone in sunlight, may not be able to make out this text. It's one of the most common barriers on public sites.",
    fix: "Darken the text or lighten the background until it meets the WCAG AA ratio (4.5:1 for normal text, 3:1 for large).",
  },
  label: {
    plainTitle: "Form fields have no labels",
    residentImpact:
      "A screen reader reaches these fields without telling the user what to type, so forms like permit applications become unusable.",
    fix: "Give every input a visible, programmatically connected label.",
  },
  "link-name": {
    plainTitle: "Links have no readable text",
    residentImpact:
      "Screen reader users hear 'link' with no idea where it leads, so navigating by links breaks down.",
    fix: "Give each link clear text describing its destination; avoid bare 'click here' or unlabeled icon links.",
  },
  "button-name": {
    plainTitle: "Buttons have no readable text",
    residentImpact:
      "A screen reader announces 'button' with no clue what it does, so submitting a form becomes guesswork.",
    fix: "Give each button text, or an accessible label if it's icon-only.",
  },
  "document-title": {
    plainTitle: "The page has no title",
    residentImpact:
      "Screen reader users rely on the page title to know where they are, and it's what shows in browser tabs and search results.",
    fix: "Add a unique, descriptive <title> to the page.",
  },
  "html-has-lang": {
    plainTitle: "The page doesn't declare its language",
    residentImpact:
      "Screen readers use the page language to pronounce words correctly. Without it, content can be read in the wrong language — which matters for bilingual municipalities.",
    fix: 'Set the lang attribute on the <html> element, e.g. lang="en" or lang="fr".',
  },
  "heading-order": {
    plainTitle: "Headings are out of order",
    residentImpact:
      "Many screen reader users navigate by jumping between headings. When the order skips around, the page structure stops making sense.",
    fix: "Use heading levels in order (h1, then h2, then h3) to reflect the real structure.",
  },
  "landmark-one-main": {
    plainTitle: "The page has no main content area marked",
    residentImpact:
      "Screen reader users often jump straight to the main content to skip menus. Without a marked main area, they wade through everything each time.",
    fix: "Wrap the primary content in a <main> element.",
  },
  bypass: {
    plainTitle: "There's no way to skip repeated content",
    residentImpact:
      "Keyboard and screen reader users must tab through the full menu on every page before reaching content — exhausting on a large municipal site.",
    fix: "Add a 'Skip to main content' link as the first focusable item.",
  },
  region: {
    plainTitle: "Some content sits outside any labelled region",
    residentImpact:
      "Content not inside a landmark (header, nav, main, footer) is harder to find and skip for people navigating by structure.",
    fix: "Place meaningful content inside landmark elements.",
  },
  "frame-title": {
    plainTitle: "Embedded frames have no title",
    residentImpact:
      "Embedded content like maps or video is announced as an unnamed frame, so screen reader users don't know what it contains.",
    fix: "Add a descriptive title attribute to each iframe.",
  },
  "meta-viewport": {
    plainTitle: "Zooming is disabled",
    residentImpact:
      "Some sites block pinch-to-zoom. People with low vision rely on zoom to read, so this locks them out on mobile.",
    fix: "Remove user-scalable=no and maximum-scale limits from the viewport meta tag.",
  },
};

export interface RawAxeNode {
  target?: string[];
  html?: string;
}

export interface RawAxeViolation {
  id: string;
  impact?: string | null;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: RawAxeNode[];
}

// axe tags look like ["cat.text-alternatives", "wcag2a", "wcag111"].
// Pull out the criteria (wcag111 -> 1.1.1) and the strictest level present.
export function parseWcag(tags: string[]): WcagRef {
  const criteria = new Set<string>();
  let rank = 0; // 0=—, 1=A, 2=AA, 3=AAA

  for (const tag of tags) {
    const m = /^wcag(\d)(\d)(\d{1,2})$/.exec(tag);
    if (m) criteria.add(`${m[1]}.${m[2]}.${Number(m[3])}`);

    if (/^wcag\d*aaa$/.test(tag)) rank = Math.max(rank, 3);
    else if (/^wcag\d*aa$/.test(tag)) rank = Math.max(rank, 2);
    else if (/^wcag\d*a$/.test(tag)) rank = Math.max(rank, 1);
  }

  const level = (["—", "A", "AA", "AAA"] as const)[rank];
  return { criteria: [...criteria].sort(), level };
}

function normalizeImpact(raw?: string | null): Impact {
  switch (raw) {
    case "critical":
      return "critical";
    case "serious":
      return "serious";
    case "moderate":
      return "moderate";
    default:
      return "minor";
  }
}

export function translateViolation(v: RawAxeViolation): TranslatedViolation {
  const copy = RULE_COPY[v.id];
  const nodes = v.nodes ?? [];

  return {
    id: v.id,
    impact: normalizeImpact(v.impact),
    plainTitle: copy?.plainTitle ?? v.help,
    residentImpact: copy?.residentImpact ?? v.description,
    fix: copy?.fix ?? "See the linked guidance for how to resolve this.",
    wcag: parseWcag(v.tags),
    helpUrl: v.helpUrl,
    nodeCount: nodes.length,
    sampleSelectors: nodes
      .slice(0, 3)
      .map((n) => (n.target ?? []).join(" "))
      .filter(Boolean),
    sampleHtml: (nodes[0]?.html ?? "").slice(0, 300),
  };
}

const IMPACT_ORDER: Record<Impact, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

export function sortByImpact(
  list: TranslatedViolation[]
): TranslatedViolation[] {
  return [...list].sort(
    (a, b) =>
      IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact] ||
      b.nodeCount - a.nodeCount
  );
}