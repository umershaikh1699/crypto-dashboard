import type { CryptoCard, CryptoTrend } from "../contracts";

const upTrend: CryptoTrend = {
  points: [49000, 49400, 49800, 50000],
  changePct24h: 2.04,
  direction: "up",
};

const downTrend: CryptoTrend = {
  points: [2100, 2080, 2040, 2000],
  changePct24h: -4.76,
  direction: "down",
};

const flatTrend: CryptoTrend = {
  points: [100, 100.01, 99.99, 100],
  changePct24h: 0,
  direction: "flat",
};

export const cryptoCardFixtures: readonly CryptoCard[] = [
  { symbol: "BTC", name: "Bitcoin", usdRate: 50000, btcRate: 1, trend: upTrend, lastUpdated: "now" },
  { symbol: "ETH", name: "Ethereum", usdRate: 2000, btcRate: 0.04, trend: downTrend, lastUpdated: "now" },
  { symbol: "SOL", name: "Solana", usdRate: 100, btcRate: 0.002, trend: flatTrend, lastUpdated: "now" },
  { symbol: "XRP", name: "XRP", usdRate: 0.6, btcRate: 0.000012, trend: null, lastUpdated: "now" },
  { symbol: "DOGE", name: "Dogecoin", usdRate: 0.12, btcRate: 0.0000024, trend: null, lastUpdated: "now" },
  { symbol: "ADA", name: "Cardano", usdRate: 0.45, btcRate: 0.000009, trend: null, lastUpdated: "now" },
  { symbol: "LTC", name: "Litecoin", usdRate: 80, btcRate: 0.0016, trend: null, lastUpdated: "now" },
  { symbol: "BCH", name: "Bitcoin Cash", usdRate: 420, btcRate: 0.0084, trend: null, lastUpdated: "now" },
  { symbol: "LINK", name: "Chainlink", usdRate: 14, btcRate: 0.00028, trend: null, lastUpdated: "now" },
  { symbol: "AVAX", name: "Avalanche", usdRate: 28, btcRate: 0.00056, trend: null, lastUpdated: "now" },
  { symbol: "DOT", name: "Polkadot", usdRate: 6, btcRate: 0.00012, trend: null, lastUpdated: "now" },
  { symbol: "UNI", name: "Uniswap", usdRate: 10, btcRate: 0.0002, trend: null, lastUpdated: "now" },
];
