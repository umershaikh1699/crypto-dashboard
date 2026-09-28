import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, ReactElement } from "react";

import type { CryptoCard, CryptoTrend, TrendDirection } from "../../contracts";
import { formatBtcRate, formatChangePct, formatUsdRate } from "../presentation/formatters";
import { TrendSparkline } from "./TrendSparkline";

type SortableCryptoCardProps = Readonly<{
  card: CryptoCard;
  dragDisabled: boolean;
}>;

const DIRECTION_GLYPHS: Readonly<Record<TrendDirection, string>> = {
  up: "▲",
  down: "▼",
  flat: "→",
};

type CardTrendProps = Readonly<{
  trend: CryptoTrend | null;
  coinName: string;
}>;

function CardTrend({ trend, coinName }: CardTrendProps): ReactElement {
  if (trend === null) {
    return (
      <div className="trend-row">
        <span className="trend-unavailable muted">24h trend unavailable</span>
      </div>
    );
  }

  return (
    <div className="trend-row">
      <TrendSparkline points={trend.points} label={`24-hour USD trend for ${coinName}`} />
      <div className="trend-meta">
        <span className="trend-caption">24H</span>
        <span className={`trend-delta trend-${trend.direction}`}>
          <span aria-hidden="true">{DIRECTION_GLYPHS[trend.direction]} </span>
          {formatChangePct(trend.changePct24h)}
        </span>
      </div>
    </div>
  );
}

export function SortableCryptoCard({
  card,
  dragDisabled,
}: SortableCryptoCardProps): ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.symbol,
    disabled: dragDisabled,
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`crypto-card${isDragging ? " is-dragging" : ""}`}
      data-testid="crypto-card"
    >
      <div className="card-topline">
        <div>
          <h2>{card.name}</h2>
          <span className="symbol">{card.symbol}</span>
        </div>
        <button
          className="drag-handle"
          type="button"
          disabled={dragDisabled}
          aria-label={`Reorder ${card.name}`}
          title={dragDisabled ? "Choose Custom order to drag cards" : `Reorder ${card.name}`}
          {...attributes}
          {...listeners}
        >
          <span aria-hidden="true">↕</span>
        </button>
      </div>
      <CardTrend trend={card.trend} coinName={card.name} />
      <dl className="rate-list">
        <div>
          <dt>USD</dt>
          <dd className={card.usdRate === null ? "muted" : ""}>{formatUsdRate(card.usdRate)}</dd>
        </div>
        <div>
          <dt>BTC</dt>
          <dd className={card.btcRate === null ? "muted" : ""}>{formatBtcRate(card.btcRate)}</dd>
        </div>
      </dl>
    </article>
  );
}
