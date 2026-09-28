import type { ReactElement } from "react";

import {
  buildSparklineGeometry,
  SPARKLINE_FRAME,
  type SparklineGeometry,
} from "../presentation/sparkline-geometry";

type TrendSparklineProps = Readonly<{
  /** Hourly closes, oldest first. */
  points: readonly number[];
  /** Accessible description, e.g. "24-hour USD trend for Bitcoin". */
  label: string;
}>;

const LINE_STROKE_WIDTH = 2;
const END_DOT_RADIUS = 3;

/**
 * A single-series inline-SVG sparkline. Color comes from CSS custom
 * properties so light/dark themes swap without re-rendering, and the numeric
 * delta chip beside it carries the direction — the line never encodes
 * meaning through color alone.
 */
export function TrendSparkline({ points, label }: TrendSparklineProps): ReactElement | null {
  const geometry: SparklineGeometry | null = buildSparklineGeometry(points);

  if (geometry === null) {
    return null;
  }

  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${String(SPARKLINE_FRAME.width)} ${String(SPARKLINE_FRAME.height)}`}
      role="img"
      aria-label={label}
      focusable="false"
    >
      <path
        className="sparkline-line"
        d={geometry.linePath}
        fill="none"
        strokeWidth={LINE_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        className="sparkline-end"
        cx={geometry.endX}
        cy={geometry.endY}
        r={END_DOT_RADIUS}
      />
    </svg>
  );
}
