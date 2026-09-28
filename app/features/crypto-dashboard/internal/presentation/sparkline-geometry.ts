/**
 * Pure SVG geometry for the 24h trend sparkline. Kept free of React so the
 * scaling math is testable in isolation and the component stays a thin view.
 */

export type SparklineGeometry = Readonly<{
  /** SVG path data for the trend line, e.g. "M 2 30 L 10 24 ...". */
  linePath: string;
  /** Coordinates of the most recent point, for the end-of-line marker. */
  endX: number;
  endY: number;
}>;

type SparklineFrame = Readonly<{
  width: number;
  height: number;
  /** Padding inside the viewBox so the stroke and end dot never clip. */
  inset: number;
}>;

export const SPARKLINE_FRAME: SparklineFrame = {
  width: 120,
  height: 36,
  inset: 4,
};

function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Maps points (oldest first) into the sparkline frame. The y-scale spans the
 * series' own min..max so small moves stay visible; a perfectly flat series
 * renders as a midline. Returns null for fewer than two points.
 */
export function buildSparklineGeometry(
  points: readonly number[],
  frame: SparklineFrame = SPARKLINE_FRAME,
): SparklineGeometry | null {
  if (points.length < 2) {
    return null;
  }

  const min: number = Math.min(...points);
  const max: number = Math.max(...points);
  const valueRange: number = max - min;
  const innerWidth: number = frame.width - frame.inset * 2;
  const innerHeight: number = frame.height - frame.inset * 2;
  const stepX: number = innerWidth / (points.length - 1);

  const coordinates: readonly (readonly [number, number])[] = points.map(
    (point: number, index: number): readonly [number, number] => {
      const normalized: number = valueRange === 0 ? 0.5 : (point - min) / valueRange;
      const x: number = roundTo2(frame.inset + index * stepX);
      const y: number = roundTo2(frame.inset + (1 - normalized) * innerHeight);
      return [x, y];
    },
  );

  const linePath: string = coordinates
    .map(([x, y]: readonly [number, number], index: number): string =>
      index === 0 ? `M ${String(x)} ${String(y)}` : `L ${String(x)} ${String(y)}`,
    )
    .join(" ");

  const lastCoordinate: readonly [number, number] | undefined =
    coordinates[coordinates.length - 1];

  if (lastCoordinate === undefined) {
    return null;
  }

  return {
    linePath,
    endX: lastCoordinate[0],
    endY: lastCoordinate[1],
  };
}
