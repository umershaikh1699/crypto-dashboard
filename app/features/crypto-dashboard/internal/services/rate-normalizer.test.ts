import { describe, expect, it } from "vitest";

import { normalizeCryptoCards } from "../../server";

describe("normalizeCryptoCards", () => {
  it("converts Coinbase USD rates into USD prices", (): void => {
    const cards = normalizeCryptoCards({
      usdRates: {
        BTC: "0.00002",
        ETH: "0.0005",
      },
      btcRates: {
        ETH: "25",
      },
      lastUpdated: "2026-07-07T12:00:00.000Z",
    });

    const bitcoin = cards.find((card) => card.symbol === "BTC");
    const ethereum = cards.find((card) => card.symbol === "ETH");

    expect(bitcoin?.usdRate).toBeCloseTo(50000);
    expect(ethereum?.usdRate).toBe(2000);
  });

  it("computes BTC rates from direct BTC exchange data", (): void => {
    const cards = normalizeCryptoCards({
      usdRates: {
        BTC: "0.00002",
        ETH: "0.0005",
      },
      btcRates: {
        ETH: "25",
      },
    });

    expect(cards.find((card) => card.symbol === "BTC")?.btcRate).toBe(1);
    expect(cards.find((card) => card.symbol === "ETH")?.btcRate).toBe(0.04);
  });

  it("falls back to USD-derived BTC rates and leaves missing rates null", (): void => {
    const cards = normalizeCryptoCards({
      usdRates: {
        BTC: "0.00002",
        SOL: "0.01",
      },
      btcRates: {},
    });

    expect(cards.find((card) => card.symbol === "SOL")?.btcRate).toBeCloseTo(0.002);
    expect(cards.find((card) => card.symbol === "UNI")?.usdRate).toBeNull();
  });
});
