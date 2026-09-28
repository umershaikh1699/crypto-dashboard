import { describe, expect, it } from "vitest";

import { buildSparklineGeometry, SPARKLINE_FRAME } from "./sparkline-geometry";

describe("buildSparklineGeometry", () => {
  it("maps the series across the frame with min at the bottom and max at the top", (): void => {
    const geometry = buildSparklineGeometry([10, 20], SPARKLINE_FRAME);

    expect(geometry).not.toBeNull();
    // min (first point) sits at the bottom inset, max (last) at the top inset.
    expect(geometry?.linePath).toBe("M 4 32 L 116 4");
    expect(geometry?.endX).toBe(116);
    expect(geometry?.endY).toBe(4);
  });

  it("renders a flat series as a midline", (): void => {
    const geometry = buildSparklineGeometry([5, 5, 5], SPARKLINE_FRAME);

    expect(geometry?.linePath).toBe("M 4 18 L 60 18 L 116 18");
    expect(geometry?.endY).toBe(18);
  });

  it("spaces points evenly across the width", (): void => {
    const geometry = buildSparklineGeometry([1, 2, 3, 4, 5], SPARKLINE_FRAME);
    const xValues: readonly number[] =
      geometry?.linePath
        .split(/[ML]/)
        .map((segment: string): string => segment.trim())
        .filter((segment: string): boolean => segment.length > 0)
        .map((segment: string): number => Number(segment.split(" ")[0])) ?? [];

    expect(xValues).toEqual([4, 32, 60, 88, 116]);
  });

  it("returns null for fewer than two points", (): void => {
    expect(buildSparklineGeometry([], SPARKLINE_FRAME)).toBeNull();
    expect(buildSparklineGeometry([42], SPARKLINE_FRAME)).toBeNull();
  });
});
