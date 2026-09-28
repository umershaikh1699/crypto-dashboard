import type { CryptoTrend, TrendDirection } from "../../contracts";

/**
 * Changes smaller than this (in percentage points) render as "flat" so the
 * delta chip does not flip color on sub-noise movements.
 */
const FLAT_THRESHOLD_PCT = 0.05;

function toDirection(changePct: number): TrendDirection {
  if (changePct > FLAT_THRESHOLD_PCT) {
    return "up";
  }

  if (changePct < -FLAT_THRESHOLD_PCT) {
    return "down";
  }

  return "flat";
}

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

/**
 * Builds a display-ready trend from hourly closes (oldest first). Returns
 * null when there are not enough valid points to describe a trend, so
 * callers never render a misleading sparkline from bad data.
 */
export function buildTrend(points: readonly number[] | null): CryptoTrend | null {
  if (points === null || points.length < 2 || !points.every(isPositiveFinite)) {
    return null;
  }

  const first: number | undefined = points[0];
  const last: number | undefined = points[points.length - 1];

  if (first === undefined || last === undefined) {
    return null;
  }

  const changePct24h: number = ((last - first) / first) * 100;

  return {
    points,
    changePct24h,
    direction: toDirection(changePct24h),
  };
}
