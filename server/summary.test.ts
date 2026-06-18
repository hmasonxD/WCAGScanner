import { describe, it, expect } from "vitest";
import { buildSummary } from "./summary";
import type { TranslatedViolation } from "./types";

const v = (impact: TranslatedViolation["impact"]): TranslatedViolation =>
  ({ impact } as TranslatedViolation);

describe("buildSummary", () => {
  it("counts violations by severity", () => {
    const s = buildSummary([v("critical"), v("critical"), v("minor")], 10, 2);
    expect(s.total).toBe(3);
    expect(s.critical).toBe(2);
    expect(s.minor).toBe(1);
    expect(s.serious).toBe(0);
  });
  it("carries passes and incomplete through", () => {
    const s = buildSummary([], 42, 7);
    expect(s).toMatchObject({ total: 0, passes: 42, incomplete: 7 });
  });
});