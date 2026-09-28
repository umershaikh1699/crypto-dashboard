import { describe, expect, it } from "vitest";

import { buildTrend } from "./trend-builder";

describe("buildTrend", () => {
  it("computes the percentage change from first to last point", (): void => {
    const trend = buildTrend([100, 105, 110]);

    expect(trend).not.toBeNull();
    expect(trend?.changePct24h).toBeCloseTo(10);
    expect(trend?.direction).toBe("up");
    expect(trend?.points).toEqual([100, 105, 110]);
  });

  it("flags a falling series as down", (): void => {
    const trend = buildTrend([200, 190, 180]);

    expect(trend?.changePct24h).toBeCloseTo(-10);
    expect(trend?.direction).toBe("down");
  });

  it("treats sub-threshold movement as flat", (): void => {
    const trend = buildTrend([100, 100.02]);

    expect(trend?.direction).toBe("flat");
  });

  it("returns null for null input", (): void => {
    expect(buildTrend(null)).toBeNull();
  });

  it("returns null for fewer than two points", (): void => {
    expect(buildTrend([])).toBeNull();
    expect(buildTrend([100])).toBeNull();
  });

  it("returns null when any point is non-positive or non-finite", (): void => {
    expect(buildTrend([100, 0, 110])).toBeNull();
    expect(buildTrend([100, -5, 110])).toBeNull();
    expect(buildTrend([100, Number.NaN, 110])).toBeNull();
    expect(buildTrend([100, Number.POSITIVE_INFINITY])).toBeNull();
  });
});
