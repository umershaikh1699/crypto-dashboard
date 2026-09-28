import type { CryptoSymbol } from "../../contracts";
import { parseCandleCloses } from "./candle-parser";

const COINBASE_EXCHANGE_API_URL = "https://api.exchange.coinbase.com";
const CANDLE_GRANULARITY_SECONDS = 3600;
const TREND_WINDOW_HOURS = 24;
const REQUEST_TIMEOUT_MS = 8_000;
const MS_PER_HOUR = 3_600_000;

/**
 * Fetches hourly closing prices for the last 24 hours of a symbol's USD pair.
 *
 * Returns null on any failure (network, HTTP error, malformed payload):
 * trend data is an enhancement, and a single symbol's candle outage must
 * never take down the whole dashboard the way a rates failure does.
 */
export async function fetchHourlyUsdCloses(
  symbol: CryptoSymbol,
  now: Date,
): Promise<readonly number[] | null> {
  const start: Date = new Date(now.getTime() - TREND_WINDOW_HOURS * MS_PER_HOUR);
  const url: URL = new URL(`/products/${symbol}-USD/candles`, COINBASE_EXCHANGE_API_URL);
  url.searchParams.set("granularity", String(CANDLE_GRANULARITY_SECONDS));
  url.searchParams.set("start", start.toISOString());
  url.searchParams.set("end", now.toISOString());

  try {
    const response: Response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();
    return parseCandleCloses(payload);
  } catch {
    return null;
  }
}
