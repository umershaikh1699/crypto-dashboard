export const CRYPTO_SYMBOLS = [
  "BTC",
  "ETH",
  "SOL",
  "XRP",
  "DOGE",
  "ADA",
  "LTC",
  "BCH",
  "LINK",
  "AVAX",
  "DOT",
  "UNI",
] as const;

export const SORT_MODES = ["custom", "name", "usd", "btc"] as const;

export const THEME_MODES = ["light", "dark"] as const;

export type CryptoSymbol = (typeof CRYPTO_SYMBOLS)[number];

export type SortMode = (typeof SORT_MODES)[number];

export type ThemeMode = (typeof THEME_MODES)[number];

export type TrendDirection = "up" | "down" | "flat";

export type CryptoTrend = Readonly<{
  /** Hourly USD closing prices, oldest first, covering the last 24 hours. */
  points: readonly number[];
  /** Percentage change between the first and last point, e.g. 1.4 for +1.4%. */
  changePct24h: number;
  direction: TrendDirection;
}>;

export type CryptoCard = Readonly<{
  symbol: CryptoSymbol;
  name: string;
  usdRate: number | null;
  btcRate: number | null;
  /** Null when 24h candle data is unavailable; the card degrades gracefully. */
  trend: CryptoTrend | null;
  lastUpdated: string;
}>;

export type CryptoDashboardData = Readonly<{
  cards: readonly CryptoCard[];
  lastUpdated: string;
}>;

export type ExchangeRateMap = Readonly<Record<string, string>>;
