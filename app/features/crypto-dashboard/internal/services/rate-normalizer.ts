import {
  CRYPTO_SYMBOLS,
  type CryptoCard,
  type CryptoSymbol,
  type ExchangeRateMap,
} from "../../contracts";

type NormalizeCryptoCardsParams = Readonly<{
  usdRates: ExchangeRateMap;
  btcRates: ExchangeRateMap;
  lastUpdated?: string;
}>;

const CRYPTO_NAMES: Record<CryptoSymbol, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  XRP: "XRP",
  DOGE: "Dogecoin",
  ADA: "Cardano",
  LTC: "Litecoin",
  BCH: "Bitcoin Cash",
  LINK: "Chainlink",
  AVAX: "Avalanche",
  DOT: "Polkadot",
  UNI: "Uniswap",
};

function parsePositiveRate(value: string | undefined): number | null {
  if (value === undefined) {
    return null;
  }

  const parsed: number = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function invertRate(value: string | undefined): number | null {
  const parsed: number | null = parsePositiveRate(value);
  return parsed === null ? null : 1 / parsed;
}

function divideRates(numerator: number | null, denominator: number | null): number | null {
  if (numerator === null || denominator === null) {
    return null;
  }

  return numerator / denominator;
}

export function normalizeCryptoCards(params: NormalizeCryptoCardsParams): readonly CryptoCard[] {
  const lastUpdated: string = params.lastUpdated ?? new Date().toISOString();
  const btcUsdRate: number | null = invertRate(params.usdRates.BTC);

  return CRYPTO_SYMBOLS.map((symbol: CryptoSymbol): CryptoCard => {
    const usdRate: number | null = invertRate(params.usdRates[symbol]);
    const directBtcRate: number | null =
      symbol === "BTC" ? 1 : invertRate(params.btcRates[symbol]);
    const btcRate: number | null = directBtcRate ?? divideRates(usdRate, btcUsdRate);

    return {
      symbol,
      name: CRYPTO_NAMES[symbol],
      usdRate,
      btcRate,
      // Trends come from a separate candle feed; the dashboard loader
      // attaches them after normalization.
      trend: null,
      lastUpdated,
    };
  });
}
