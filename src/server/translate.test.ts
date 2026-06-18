import { describe, it, expect } from "vitest";
import {
  parseWcag,
  translateViolation,
  sortByImpact,
  type RawAxeViolation,
} from "./translate";

describe("parseWcag", () => {
  it("parses criteria and level A", () => {
    expect(parseWcag(["cat.text-alternatives", "wcag2a", "wcag111"]))
      .toEqual({ criteria: ["1.1.1"], level: "A" });
  });
  it("parses level AA", () => {
    expect(parseWcag(["wcag2aa", "wcag143"]))
      .toEqual({ criteria: ["1.4.3"], level: "AA" });
  });
  it("handles multi-digit criteria", () => {
    expect(parseWcag(["wcag2412"]).criteria).toEqual(["2.4.12"]);
  });
  it("lets AA win over A", () => {
    expect(parseWcag(["wcag2a", "wcag2aa"]).level).toBe("AA");
  });
  it("returns a dash when no wcag tags present", () => {
    expect(parseWcag(["cat.keyboard"])).toEqual({ criteria: [], level: "—" });
  });
});

const knownRule: RawAxeViolation = {
  id: "image-alt",
  impact: "critical",
  description: "Ensures <img> elements have alternate text",
  help: "Images must have alternate text",
  helpUrl: "https://example.com/image-alt",
  tags: ["wcag2a", "wcag111"],
  nodes: [
    { target: ["header > img"], html: "<img src='a.png'>" },
    { target: ["main", ".hero img"], html: "<img src='b.png'>" },
  ],
};

describe("translateViolation", () => {
  it("uses custom copy for a known rule", () => {
    const r = translateViolation(knownRule);
    expect(r.residentImpact).not.toBe(knownRule.description); // your words, not axe's
    expect(r.plainTitle.length).toBeGreaterThan(0);
  });
  it("carries through structural data", () => {
    const r = translateViolation(knownRule);
    expect(r.id).toBe("image-alt");
    expect(r.impact).toBe("critical");
    expect(r.nodeCount).toBe(2);
    expect(r.sampleSelectors).toEqual(["header > img", "main .hero img"]);
    expect(r.wcag).toEqual({ criteria: ["1.1.1"], level: "A" });
  });
  it("caps sample selectors at 3 and truncates html to 300 chars", () => {
    const many: RawAxeViolation = {
      ...knownRule,
      nodes: Array.from({ length: 5 }, (_, i) => ({
        target: [`#n${i}`],
        html: "x".repeat(500),
      })),
    };
    const r = translateViolation(many);
    expect(r.sampleSelectors).toHaveLength(3);
    expect(r.sampleHtml).toHaveLength(300);
  });
  it("falls back to axe text for unknown rules", () => {
    const unknown: RawAxeViolation = {
      ...knownRule,
      id: "some-future-rule",
      nodes: [],
    };
    const r = translateViolation(unknown);
    expect(r.plainTitle).toBe(unknown.help);
    expect(r.residentImpact).toBe(unknown.description);
  });
  it("defaults missing impact to minor", () => {
    expect(translateViolation({ ...knownRule, impact: null }).impact).toBe("minor");
  });
});

describe("sortByImpact", () => {
  it("orders critical first, then by node count", () => {
    const mk = (impact: any, nodeCount: number): any => ({ impact, nodeCount });
    const sorted = sortByImpact([
      mk("moderate", 1), mk("critical", 1), mk("serious", 1), mk("serious", 9),
    ]);
    expect(sorted.map((v) => `${v.impact}:${v.nodeCount}`))
      .toEqual(["critical:1", "serious:9", "serious:1", "moderate:1"]);
  });
});