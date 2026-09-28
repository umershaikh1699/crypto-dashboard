import {
  CRYPTO_SYMBOLS,
  type CryptoCard,
  type CryptoDashboardData,
  type CryptoSymbol,
  type ExchangeRateMap,
} from "../../contracts";
import { fetchCoinbaseExchangeRates } from "./coinbase.server";
import { fetchHourlyUsdCloses } from "./coinbase-candles.server";
import { normalizeCryptoCards } from "./rate-normalizer";
import { buildTrend } from "./trend-builder";
import { createTtlCache, type TtlCache } from "./ttl-cache";

/**
 * One upstream round-trip per TTL window regardless of traffic. Keeps the
 * dashboard inside Coinbase's public rate limits and makes page loads after
 * the first one effectively free. Held just under the client's 30s
 * auto-refresh interval so every poll crosses the TTL and gets fresh data.
 */
const DASHBOARD_CACHE_TTL_MS = 20_000;
const DASHBOARD_CACHE_KEY = "crypto-dashboard";

const dashboardCache: TtlCache<CryptoDashboardData> =
  createTtlCache<CryptoDashboardData>(DASHBOARD_CACHE_TTL_MS);

async function fetchAllHourlyCloses(
  now: Date,
): Promise<ReadonlyMap<CryptoSymbol, readonly number[] | null>> {
  const entries: readonly [CryptoSymbol, readonly number[] | null][] = await Promise.all(
    CRYPTO_SYMBOLS.map(
      async (symbol: CryptoSymbol): Promise<[CryptoSymbol, readonly number[] | null]> => [
        symbol,
        await fetchHourlyUsdCloses(symbol, now),
      ],
    ),
  );

  return new Map<CryptoSymbol, readonly number[] | null>(entries);
}

async function loadDashboardData(): Promise<CryptoDashboardData> {
  const now: Date = new Date();
  const [usdRates, btcRates, closesBySymbol]: [
    ExchangeRateMap,
    ExchangeRateMap,
    ReadonlyMap<CryptoSymbol, readonly number[] | null>,
  ] = await Promise.all([
    fetchCoinbaseExchangeRates("USD"),
    fetchCoinbaseExchangeRates("BTC"),
    fetchAllHourlyCloses(now),
  ]);
  const lastUpdated: string = now.toISOString();

  const cards: readonly CryptoCard[] = normalizeCryptoCards({
    usdRates,
    btcRates,
    lastUpdated,
  }).map(
    (card: CryptoCard): CryptoCard => ({
      ...card,
      trend: buildTrend(closesBySymbol.get(card.symbol) ?? null),
    }),
  );

  return { cards, lastUpdated };
}

export function getCachedDashboardData(): Promise<CryptoDashboardData> {
  return dashboardCache.get(DASHBOARD_CACHE_KEY, loadDashboardData);
}
