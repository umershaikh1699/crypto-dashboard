import type { ExchangeRateMap } from "../../contracts";

export type CoinbaseCurrency = "USD" | "BTC";

type CoinbaseRatesResponse = Readonly<{
  data?: Readonly<{
    currency?: string;
    rates?: Record<string, string>;
  }>;
}>;

const COINBASE_EXCHANGE_RATES_URL = "https://api.coinbase.com/v2/exchange-rates";
const REQUEST_TIMEOUT_MS = 8_000;

function isRateMap(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every((rate: unknown): rate is string => typeof rate === "string")
  );
}

function parseCoinbaseRatesResponse(payload: unknown): ExchangeRateMap {
  const candidate: CoinbaseRatesResponse = payload as CoinbaseRatesResponse;
  return isRateMap(candidate.data?.rates) ? candidate.data.rates : {};
}

export async function fetchCoinbaseExchangeRates(
  currency: CoinbaseCurrency,
): Promise<ExchangeRateMap> {
  const response: Response = await fetch(
    `${COINBASE_EXCHANGE_RATES_URL}?currency=${currency}`,
    {
      headers: {
        Accept: "application/json",
      },
      // A hung upstream connection must fail fast instead of hanging the
      // loader; the route ErrorBoundary turns the failure into a retry UI.
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    // Remix converts a thrown Response into the route's ErrorBoundary.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response(
      `Coinbase returned ${String(response.status)} for ${currency} rates`,
      { status: 502 },
    );
  }

  const payload: unknown = await response.json();
  return parseCoinbaseRatesResponse(payload);
}
