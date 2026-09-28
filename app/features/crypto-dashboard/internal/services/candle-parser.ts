/**
 * Pure parsing for Coinbase Exchange candle payloads.
 *
 * The API returns `[[time, low, high, open, close, volume], ...]` with the
 * newest candle first. Parsing is intentionally lenient: malformed rows are
 * dropped rather than failing the whole payload, because a partial trend is
 * still useful and the card degrades to "unavailable" only when fewer than
 * two valid candles remain.
 */

type CandleTuple = readonly [
  timestamp: number,
  low: number,
  high: number,
  open: number,
  close: number,
  volume: number,
];

const CANDLE_TUPLE_LENGTH = 6;
const CANDLE_CLOSE_INDEX = 4;
const CANDLE_TIMESTAMP_INDEX = 0;
const MINIMUM_CANDLE_COUNT = 2;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isCandleTuple(value: unknown): value is CandleTuple {
  return (
    Array.isArray(value) &&
    value.length >= CANDLE_TUPLE_LENGTH &&
    value.slice(0, CANDLE_TUPLE_LENGTH).every(isFiniteNumber)
  );
}

/**
 * Extracts closing prices ordered oldest-first, or null when the payload does
 * not contain at least two valid candles.
 */
export function parseCandleCloses(payload: unknown): readonly number[] | null {
  if (!Array.isArray(payload)) {
    return null;
  }

  const candles: readonly CandleTuple[] = payload.filter(isCandleTuple);

  if (candles.length < MINIMUM_CANDLE_COUNT) {
    return null;
  }

  return [...candles]
    .sort(
      (a: CandleTuple, b: CandleTuple): number =>
        a[CANDLE_TIMESTAMP_INDEX] - b[CANDLE_TIMESTAMP_INDEX],
    )
    .map((candle: CandleTuple): number => candle[CANDLE_CLOSE_INDEX]);
}
